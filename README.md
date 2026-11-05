# DEVUTEC — Mobile

App móvil de DEVUTEC, hecha con React Native y Expo (SDK 58) y navegación con expo-router.

## Cómo correrla

```bash
npm install
npx expo start
```

Escanea el QR con la app **Expo Go** (Android o iOS); el celular y la computadora deben estar en la misma red. También se puede abrir en el navegador con `npm run web`.

Sin `.env`, la app usa el backend local (`http://<IP de tu compu>:8080/api/v1`): toma la IP de la dirección con la que Expo Go abrió la app, así que funciona aunque cambies de wifi. Para usar otro backend, por ejemplo el de AWS, copia `.env.example` a `.env`:

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL base de la API, con `/api/v1` al final. Opcional en desarrollo |

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
- `OfflineScreen` muestra una pantalla completa con Cuyi durmiendo mientras no hay conexión, con un botón **Reintentar** que vuelve a revisarla. Va en un `Modal`, así queda encima de todo sin perder la pantalla donde estaba la persona, y se quita sola al volver el internet.
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

- `AnimatedSplash`: al abrir la app, sobre negro, el logo DU crece en el centro mientras gira -135°, vuelve a su tamaño y a 0° con un pequeño rebote, y la pantalla negra se quita de golpe para mostrar la app. Es igual en modo claro y oscuro.
- Mientras dura la animación se muestra solo ella, a pantalla completa, y al terminar se dibujan las pantallas. `IntroContext` avisa cuando la app ya se ve. `FadeInUp` lo usa para que las animaciones de una pantalla no ocurran escondidas detrás de la intro:

```jsx
<FadeInUp delay={150}>
  <Text>Aparece subiendo un poco</Text>
</FadeInUp>
```

- En la bienvenida, `PaymentFlow` muestra cómo funciona la app: una moneda S/ sale del cliente, queda en la garantía (el escudo late) y llega al developer (Cuyi). El resto entra en cascada.
- Las pantallas entran desde la derecha y se puede volver deslizando; login y registro además tienen un botón con flecha.

## QR del perfil y escáner

- En la pestaña **Perfil**, cada freelancer ve su código QR (`src/components/ProfileQr.jsx`) y puede compartir el enlace.
- El QR guarda `devutec://freelancers/{userId}`. `src/utils/profileLink.js` arma ese enlace y lo lee; también acepta la URL del perfil en la web o solo el número.
- En **Inicio**, el botón "Escanear el QR de un freelancer" abre `app/scan.jsx`, que usa la cámara trasera (`expo-camera`) y abre `app/freelancers/[userId].jsx` con el perfil público y sus repos de GitHub.
- Si un QR no es de DevUTEC, se avisa en la pantalla y se puede volver a escanear a los 2 segundos.

### Permisos denegados y alternativas

- Antes de pedir la cámara se explica para qué se usa. `src/components/PermissionNotice.jsx` sirve para cualquier permiso: si todavía se puede preguntar, muestra "Permitir acceso"; si el usuario lo negó para siempre, muestra "Abrir ajustes".
- Si se niega el permiso, el dispositivo no tiene cámara o la cámara falla al abrir, se puede pegar el enlace o escribir el número del perfil (`src/components/ManualProfileEntry.jsx`).
- La biometría (`useBiometricAuth`) tiene su propia alternativa: el código del celular o una confirmación con dos botones.

## Cómo agregar una pantalla

- **Una pestaña nueva:** crear el archivo en `app/(tabs)/` y agregarlo en `app/(tabs)/_layout.jsx` con su título e ícono.
- **Una pantalla de detalle** (por ejemplo `/projects/5`): crear `app/projects/[id].jsx` y abrirla con `router.push('/projects/5')`.

## Tema: modo claro y oscuro

La paleta es la de Fundamentos del diseño (Ink, Paper, Surface, Line, Escrow, Lime, Pending, Error y Progress) y está en `src/theme.js` en dos versiones, `lightColors` y `darkColors`. Por ahora la app arranca en **Claro**, porque algunas pantallas todavía usan colores fijos; en **Perfil → Apariencia** se puede elegir Sistema, Claro u Oscuro (se recuerda al volver a abrir la app). Cuando todas las pantallas usen `useTheme()`, el valor inicial en `ThemeProvider.jsx` vuelve a ser `'system'` para seguir el modo del celular.

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

Tipografías (`fonts`): Geist (`regular`, `medium`, `semibold`, `bold`, `extrabold`) y Instrument Serif cursiva (`serifItalic`) para las palabras destacadas, como "*Pago protegido.*". `import { colors } from '../src/theme'` sigue funcionando, pero siempre da la paleta clara.

## Marca

- `src/components/brand/LogoMark.jsx`: el isotipo DU (tinta en claro, lima en oscuro).
- `src/components/brand/Wordmark.jsx`: el nombre DEVUTEC en texto.
- `src/components/brand/BrandLockup.jsx`: el logo completo, símbolo DU + nombre (se usa arriba de la bienvenida, login y registro).
- `src/components/brand/Cuyi.jsx`: la mascota en pixel art de 16 × 16 (del sistema de diseño), dibujada con vistas para que se vea nítida en cualquier tamaño. Tiene cinco animaciones: `<Cuyi anim="saluda" />` (login y registro), `escribe` (cargando o enviando), `celebra` (pago liberado, propuesta aceptada), `duerme` (sin conexión) y `confundido` (404 y errores). Si el celular tiene "reducir movimiento", se queda quieto.
- Imágenes en `assets/`: `icon.png` (ícono de la app), `android-icon-*.png` (ícono adaptativo y monocromo de Android), `favicon.png`, `splash-icon.png` e `images/logo-mark*.png`. El splash nativo es el logo lima sobre tinta (96 de ancho, en `app.json`) y enseguida empieza la animación con el mismo logo en el mismo lugar.

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
