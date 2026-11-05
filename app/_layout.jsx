import { useState } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
} from '@expo-google-fonts/geist'
import { InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import AnimatedSplash from '../src/components/AnimatedSplash'
import OfflineScreen from '../src/components/OfflineScreen'
import { AuthProvider } from '../src/contexts/AuthProvider'
import { IntroContext } from '../src/contexts/introContext'
import { ThemeProvider } from '../src/contexts/ThemeProvider'
import { useAuth } from '../src/hooks/useAuth'
import { useTheme } from '../src/hooks/useTheme'

function RootNavigator() {
  const { user, loading } = useAuth()
  const { colors, fonts } = useTheme()

  // Mientras se lee la sesión guardada, la animación de entrada tapa la pantalla
  if (loading) return null

  // Con sesión: las pestañas, proyectos, postular, contratos, el escáner de QR y el perfil público;
  // sin sesión, la bienvenida, login y registro
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        // Para las pantallas que muestran la barra de arriba (Postular, Contrato...)
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.semibold, color: colors.text },
        // Las pantallas entran desde la derecha y se puede volver deslizando hacia la derecha
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Protected guard={user !== null} redirectTo="/welcome">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="projects/[id]" />
        <Stack.Screen name="projects/new" />
        <Stack.Screen name="apply/[projectId]" options={{ headerShown: true, title: 'Postular' }} />
        <Stack.Screen name="contracts/[id]" options={{ headerShown: true, title: 'Contrato' }} />
        <Stack.Screen name="scan" />
        <Stack.Screen name="freelancers/[userId]" />
      </Stack.Protected>
      <Stack.Protected guard={user === null} redirectTo="/">
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  )
}

// El splash nativo se queda visible hasta que la animación de entrada lo reemplaza
SplashScreen.preventAutoHideAsync().catch(() => {})

// Mientras dura la animación de entrada se muestra solo ella, a pantalla completa. Recién al terminar
// se dibujan las pantallas: así la navegación nativa no puede taparla, y las animaciones de la
// pantalla de abajo (FadeInUp) empiezan cuando ya se ve.
function IntroGate({ children }) {
  const { loading } = useAuth()
  const [done, setDone] = useState(false)

  if (!done) return <AnimatedSplash ready={!loading} onFinish={() => setDone(true)} />

  return <IntroContext.Provider value={true}>{children}</IntroContext.Provider>
}

// Íconos de la barra de estado claros en modo oscuro y oscuros en modo claro
function ThemedStatusBar() {
  const { isDark } = useTheme()
  return <StatusBar style={isDark ? 'light' : 'dark'} />
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
    InstrumentSerif_400Regular_Italic,
  })

  // Mientras cargan las tipografías sigue visible el splash nativo
  if (!fontsLoaded) return null

  return (
    <ThemeProvider>
      <AuthProvider>
        <IntroGate>
          <RootNavigator />
          <OfflineScreen />
        </IntroGate>
        <ThemedStatusBar />
      </AuthProvider>
    </ThemeProvider>
  )
}
