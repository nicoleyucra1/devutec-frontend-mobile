# Devutec — Mobile

App móvil de Devutec, hecha con React Native y Expo (SDK 58) y navegación con expo-router.

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
├── welcome.jsx       bienvenida, lo primero que ve quien no tiene sesión
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
- `app/_layout.jsx` usa `Stack.Protected`: con sesión solo se puede ver `(tabs)`; sin sesión, solo `welcome`, `login` y `register`. Al iniciar sesión se va a Inicio y al cerrarla, a la bienvenida (`redirectTo`).
- El access token dura 15 minutos. Cuando una petición recibe 401, el interceptor de `services/api.js` lo renueva con `/auth/refresh` y reintenta la petición una vez. Si varias peticiones fallan a la vez, todas esperan la misma renovación.

## Sin conexión y timeouts

- `src/utils/network.js` usa NetInfo para saber si hay internet. Cuenta como sin conexión no tener red o tener wifi que no llega a internet.
- `OfflineBanner` muestra una franja arriba de la pantalla mientras no hay conexión y se quita sola al volver.
- Sin conexión, el cliente `api` corta las peticiones al instante (código `ERR_OFFLINE`) en vez de esperar el timeout.
- Cada petición tiene un timeout de 15 segundos. Los GET que fallan por timeout o con 502/503/504 se reintentan solos hasta dos veces (a 1 s y a 2 s).
- Si la renovación del token falla por la red, la sesión no se cierra; solo se cierra si el backend rechaza el refresh token.
- `src/utils/errorMessage.js` convierte cualquier error en un mensaje para la pantalla:

```js
try {
  await projectService.create(data)
} catch (error) {
  setError(errorMessage(error))
}
```

## Cómo agregar una pantalla

- **Una pestaña nueva:** crear el archivo en `app/(tabs)/` y agregarlo en `app/(tabs)/_layout.jsx` con su título e ícono.
- **Una pantalla de detalle** (por ejemplo `/projects/5`): crear `app/projects/[id].jsx` y abrirla con `router.push('/projects/5')`.

## Logo

Las imágenes del logo están en `assets/`: `icon.png` (ícono de la app), `android-icon-*.png` (ícono adaptativo de Android), `favicon.png`, `images/logo.png` (bienvenida) e `images/logo-white.png` (animación de entrada). El splash nativo es solo el color `#4f46e5` (definido en `app.json`, con `splash-icon.png` transparente) y enseguida empieza la animación de `src/components/AnimatedSplash.jsx`. Si se cambia el logo, hay que actualizar `LOGO_ASPECT_RATIO` en ese archivo.

## Build con EAS

Para el build, la variable `EXPO_PUBLIC_API_URL` se define en `eas.json`, en el `env` de cada perfil, porque el archivo `.env` no se sube al repositorio.
