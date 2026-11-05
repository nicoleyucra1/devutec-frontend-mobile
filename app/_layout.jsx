import { useState } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import {
  InterTight_400Regular,
  InterTight_500Medium,
  InterTight_600SemiBold,
  InterTight_700Bold,
  InterTight_800ExtraBold,
} from '@expo-google-fonts/inter-tight'
import { InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import AnimatedSplash from '../src/components/AnimatedSplash'
import OfflineBanner from '../src/components/OfflineBanner'
import { AuthProvider } from '../src/contexts/AuthProvider'
import { IntroContext } from '../src/contexts/introContext'
import { ThemeProvider } from '../src/contexts/ThemeProvider'
import { useAuth } from '../src/hooks/useAuth'
import { useTheme } from '../src/hooks/useTheme'

function RootNavigator() {
  const { user, loading } = useAuth()
  const { colors } = useTheme()

  // Mientras se lee la sesión guardada, la animación de entrada tapa la pantalla
  if (loading) return null

  // Con sesión solo se puede entrar a las pestañas; sin sesión, a la bienvenida, login y registro
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        // Las pantallas entran desde la derecha y se puede volver deslizando hacia la derecha
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Protected guard={user !== null} redirectTo="/welcome">
        <Stack.Screen name="(tabs)" />
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

// Muestra la animación de entrada encima de la app y avisa a las pantallas cuando ya se ven
function IntroGate({ children }) {
  const { loading } = useAuth()
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(false)

  return (
    <IntroContext.Provider value={revealed}>
      {children}
      {!finished && (
        <AnimatedSplash ready={!loading} onReveal={() => setRevealed(true)} onFinish={() => setFinished(true)} />
      )}
    </IntroContext.Provider>
  )
}

// Íconos de la barra de estado claros en modo oscuro y oscuros en modo claro
function ThemedStatusBar() {
  const { isDark } = useTheme()
  return <StatusBar style={isDark ? 'light' : 'dark'} />
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_600SemiBold,
    InterTight_700Bold,
    InterTight_800ExtraBold,
    InstrumentSerif_400Regular_Italic,
  })

  // Mientras cargan las tipografías sigue visible el splash nativo
  if (!fontsLoaded) return null

  return (
    <ThemeProvider>
      <AuthProvider>
        <IntroGate>
          <RootNavigator />
          <OfflineBanner />
        </IntroGate>
        <ThemedStatusBar />
      </AuthProvider>
    </ThemeProvider>
  )
}
