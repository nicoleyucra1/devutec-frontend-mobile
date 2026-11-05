# DevUTEC — Mobile

App móvil de DevUTEC, hecha con React Native y Expo (SDK 58) y navegación con expo-router.

## Cómo correrla

```bash
cp .env.example .env
npm install
npx expo start
```

Escanea el QR con la app **Expo Go** (Android o iOS); el celular y la computadora deben estar en la misma red. También se puede abrir en el navegador con `npm run web`.

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL base de la API, con `/api/v1` al final |

## Estructura

```
app/                  pantallas (cada archivo es una ruta de expo-router)
├── _layout.jsx       layout raíz: AuthProvider y protección de rutas
├── login.jsx
├── register.jsx
└── (tabs)/           pestañas que se ven con sesión
    ├── _layout.jsx   configuración de las pestañas
    ├── index.jsx     Inicio
    ├── projects.jsx  Proyectos
    └── profile.jsx   Perfil y cerrar sesión
src/
├── components/       componentes reutilizables (FormField, PrimaryButton...)
├── contexts/         AuthContext y AuthProvider
├── hooks/            hooks propios (useAuth...)
├── services/         llamadas a la API, una por módulo
├── utils/            tokenStorage, validaciones, mensajes de error
└── theme.js          colores compartidos
```

## Cómo llamar a la API

Igual que en la web: cada módulo tiene su service en `src/services` y usa el cliente `api`, que ya agrega el token y lo renueva solo cuando vence.

```js
// src/services/projectService.js
import api from './api'

export const projectService = {
  getAll: (params) => api.get('/projects', { params }).then((res) => res.data),
}
```

## Usuario actual

```js
import { useAuth } from '../src/hooks/useAuth'

const { user, login, register, logout } = useAuth()
// user = { id, nombre, email, rol } con rol CLIENT, FREELANCER o ADMIN
```

## Sesión y tokens

- Los tokens se guardan cifrados con `expo-secure-store` (Keychain en iOS, Keystore en Android). Al abrir la app se leen y, si hay sesión, se entra directo a las pestañas.
- `app/_layout.jsx` usa `Stack.Protected`: con sesión solo se puede ver `(tabs)`; sin sesión, solo `login` y `register`. Al iniciar o cerrar sesión, la navegación cambia sola.
- El access token dura 15 minutos. Cuando una petición recibe 401, el interceptor de `services/api.js` lo renueva con `/auth/refresh` y reintenta la petición una vez. Si varias peticiones fallan a la vez, todas esperan la misma renovación.

## Cómo agregar una pantalla

- **Una pestaña nueva:** crear el archivo en `app/(tabs)/` y agregarlo en `app/(tabs)/_layout.jsx` con su título e ícono.
- **Una pantalla de detalle** (por ejemplo `/projects/5`): crear `app/projects/[id].jsx` y abrirla con `router.push('/projects/5')`.

## Build con EAS

Para el build, la variable `EXPO_PUBLIC_API_URL` se define en `eas.json`, en el `env` de cada perfil, porque el archivo `.env` no se sube al repositorio.

El proyecto pertenece a la organización **devutec** de Expo (`owner` en `app.json`) y usa el paquete `pe.edu.utec.devutec`. Perfiles de `eas.json`:

| Perfil | Para qué | Resultado |
|---|---|---|
| `preview` | Probar la app instalada en Android, sin Expo Go | Archivo `.apk` que se instala directo desde un link |
| `production` | Publicar en Google Play | Archivo `.aab` |

```bash
npm install -g eas-cli
eas login                                    # cuenta de Expo con acceso a la organización devutec
eas init                                     # solo la primera vez: vincula el proyecto y agrega su projectId
eas build --platform android --profile preview
```

Al terminar, EAS muestra un link y un QR para descargar el `.apk`. En iPhone la app se prueba con Expo Go, porque instalarla fuera del App Store requiere una cuenta de Apple Developer.
