import { Stack } from 'expo-router'

// Al entrar a este grupo se abre primero el login
export const unstable_settings = {
  initialRouteName: 'login',
}

// Pantallas para entrar o crear cuenta, sin barra de pestañas
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
