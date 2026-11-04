import { Stack } from 'expo-router'

// Pantallas para entrar o crear cuenta, sin barra de pestañas
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
