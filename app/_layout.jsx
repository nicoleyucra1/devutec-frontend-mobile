import { useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import AnimatedSplash from '../src/components/AnimatedSplash'
import OfflineBanner from '../src/components/OfflineBanner'
import { AuthProvider } from '../src/contexts/AuthProvider'
import { useAuth } from '../src/hooks/useAuth'

function RootNavigator() {
  const { user, loading } = useAuth()

  // Mientras se lee la sesión guardada, la animación de entrada tapa la pantalla
  if (loading) return null

  // Con sesión solo se puede entrar a las pestañas; sin sesión, a la bienvenida, login y registro
  return (
    <Stack screenOptions={{ headerShown: false }}>
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

function Intro() {
  const { loading } = useAuth()
  const [visible, setVisible] = useState(true)

  if (!visible) return null
  return <AnimatedSplash ready={!loading} onFinish={() => setVisible(false)} />
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
      <OfflineBanner />
      <Intro />
      <StatusBar style="dark" />
    </AuthProvider>
  )
}
