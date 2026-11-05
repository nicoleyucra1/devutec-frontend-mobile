import { useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import AnimatedSplash from '../src/components/AnimatedSplash'
import OfflineBanner from '../src/components/OfflineBanner'
import { AuthProvider } from '../src/contexts/AuthProvider'
import { IntroContext } from '../src/contexts/introContext'
import { useAuth } from '../src/hooks/useAuth'

function RootNavigator() {
  const { user, loading } = useAuth()

  // Mientras se lee la sesión guardada, la animación de entrada tapa la pantalla
  if (loading) return null

  // Con sesión solo se puede entrar a las pestañas; sin sesión, a la bienvenida, login y registro
  return (
    <Stack
      screenOptions={{
        headerShown: false,
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

export default function RootLayout() {
  return (
    <AuthProvider>
      <IntroGate>
        <RootNavigator />
        <OfflineBanner />
      </IntroGate>
      <StatusBar style="dark" />
    </AuthProvider>
  )
}
