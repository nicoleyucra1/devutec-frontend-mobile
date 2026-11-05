import { useContext, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { ThemeContext } from '../contexts/themeContext'

// Uso: const { colors, fonts, isDark } = useTheme()
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}

// Crea estilos que dependen del tema y se rehacen solo cuando cambia el modo.
// Uso: const styles = useThemedStyles(createStyles), con createStyles = ({ colors, fonts }) => ({ ... })
export function useThemedStyles(factory) {
  const theme = useTheme()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => StyleSheet.create(factory(theme)), [theme.scheme])
}
