import { useEffect, useMemo, useState } from 'react'
import { useColorScheme } from 'react-native'
import { ThemeContext } from './themeContext'
import { darkColors, fonts, lightColors, radius } from '../theme'
import { preferenceStorage } from '../utils/preferenceStorage'

const PREFERENCE_KEY = 'devutec.theme'

// Modo claro u oscuro. Por ahora arranca en "Claro" porque varias pantallas todavía usan colores fijos;
// cuando todas usen useTheme(), el valor inicial vuelve a ser 'system' para seguir al celular.
// En Perfil se puede elegir Sistema, Claro u Oscuro.
export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme()
  // 'system' | 'light' | 'dark'
  const [preference, setPreferenceState] = useState('light')

  useEffect(() => {
    preferenceStorage.get(PREFERENCE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') setPreferenceState(saved)
    })
  }, [])

  const setPreference = (value) => {
    setPreferenceState(value)
    preferenceStorage.set(PREFERENCE_KEY, value)
  }

  const scheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference

  const value = useMemo(
    () => ({
      scheme,
      isDark: scheme === 'dark',
      colors: scheme === 'dark' ? darkColors : lightColors,
      fonts,
      radius,
      preference,
      setPreference,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scheme, preference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
