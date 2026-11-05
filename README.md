# DEV U TEC — Mobile

App móvil de DEV U TEC, hecha con React Native y Expo (SDK 58) y navegación con expo-router.

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
└── theme.js          paleta clara y oscura, tipografías y radios
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

## Animaciones

- `AnimatedSplash`: al abrir la app, sobre tinta, el logo lima gira -135° y vuelve con rebote; luego se corre a la izquierda mientras "DEV U TEC" sale desde detrás de él, el fondo pasa a un degradado verde escrow (`expo-linear-gradient`) y la pantalla sube como una cortina.
- `IntroContext` avisa cuando esa cortina empieza a subir. `FadeInUp` lo usa para que las animaciones de una pantalla no ocurran escondidas detrás de la intro:

```jsx
<FadeInUp delay={150}>
  <Text>Aparece subiendo un poco</Text>
</FadeInUp>
```

- En la bienvenida, `WelcomeIllustration` muestra a Cuyi en una tarjeta lima con burbujas que flotan (`Floating`) y el resto entra en cascada.
- Las pantallas entran desde la derecha y se puede volver deslizando; login y registro además tienen un botón con flecha.

## Cómo agregar una pantalla

- **Una pestaña nueva:** crear el archivo en `app/(tabs)/` y agregarlo en `app/(tabs)/_layout.jsx` con su título e ícono.
- **Una pantalla de detalle** (por ejemplo `/projects/5`): crear `app/projects/[id].jsx` y abrirla con `router.push('/projects/5')`.

## Tema: modo claro y oscuro

La paleta es la de Fundamentos del diseño (Ink, Paper, Surface, Line, Escrow, Lime, Pending, Error y Progress) y está en `src/theme.js` en dos versiones, `lightColors` y `darkColors`. La app sigue el modo del celular y en **Perfil → Apariencia** se puede fijar Sistema, Claro u Oscuro (se recuerda al volver a abrir la app).

Para que una pantalla cambie con el modo, toma los colores de `useTheme()` y crea los estilos con `useThemedStyles()`:

```jsx
import { useTheme, useThemedStyles } from '../src/hooks/useTheme'

export default function MiPantalla() {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return <Text style={styles.title}>Hola</Text>
}

const createStyles = ({ colors, fonts, radius }) => ({
  title: { fontFamily: fonts.bold, color: colors.text },
})
```

| Color | Para qué |
|---|---|
| `background`, `card`, `border` | Fondo de pantalla, tarjetas y bordes |
| `text`, `muted` | Texto principal y secundario |
| `primary` + `onPrimary` | Botón principal (tinta en claro, lima en oscuro) y su texto |
| `accent`, `accentLight` | Verde de confianza: estados positivos y pago protegido |
| `lime` | Destacados de la marca |
| `error`, `pending`, `progress` | Estados |

Tipografías (`fonts`): Inter Tight (`regular`, `medium`, `semibold`, `bold`, `extrabold`) y Instrument Serif cursiva (`serifItalic`) para las palabras destacadas, como "*Pago protegido.*". `import { colors } from '../src/theme'` sigue funcionando, pero siempre da la paleta clara.

## Marca

- `src/components/brand/LogoMark.jsx`: el isotipo DU (tinta en claro, lima en oscuro).
- `src/components/brand/Wordmark.jsx`: el nombre DEV U TEC con la U en un círculo lima.
- `src/components/brand/Cuyi.jsx`: la mascota en pixel art (14 × 13), dibujada con vistas para que se vea nítida en cualquier tamaño. Parpadea cada tanto.
- Imágenes en `assets/`: `icon.png` (ícono de la app), `android-icon-*.png` (ícono adaptativo y monocromo de Android), `favicon.png`, `splash-icon.png` e `images/logo-mark*.png`. El splash nativo es el logo lima sobre tinta (96 de ancho, en `app.json`) y enseguida empieza la animación con el mismo logo en el mismo lugar.

## Build con EAS

Para el build, la variable `EXPO_PUBLIC_API_URL` se define en `eas.json`, en el `env` de cada perfil, porque el archivo `.env` no se sube al repositorio.
