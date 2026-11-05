// Paleta de DEVUTEC (sistema de diseño de Ari): Ink, Paper, Surface, Line, Escrow, Lime, Pending, Error y Progress.
// Hay una versión clara y una oscura. Las pantallas toman los colores con useTheme(), así cambian con el modo.
const brand = {
  ink: '#0E0E0C',
  paper: '#F5F3EE',
  surface: '#FFFFFF',
  line: '#E4E0D8',
  escrow: '#1F6F4A',
  lime: '#D7F25C',
  pending: '#B7791F',
  error: '#B42318',
  progress: '#2E5BDA',
}

export const lightColors = {
  ...brand,
  background: brand.paper,
  card: brand.surface,
  text: brand.ink,
  muted: '#6F6D67',
  border: brand.line,
  inputBorder: '#D9D4CA',
  // Botón principal: tinta con texto blanco
  primary: brand.ink,
  onPrimary: '#FFFFFF',
  primaryLight: '#EEECE6',
  // Verde de confianza para estados positivos, enlaces y el pago protegido
  accent: brand.escrow,
  accentLight: '#EAF3ED',
  limeText: brand.ink,
  errorLight: '#FBEAE7',
  pendingLight: '#F8EEDC',
  white: '#FFFFFF',
}

export const darkColors = {
  ...brand,
  background: brand.ink,
  card: '#1A1A17',
  text: brand.paper,
  muted: '#A3A197',
  border: '#2C2C27',
  inputBorder: '#3A3A34',
  // En oscuro el botón principal es lima con texto tinta
  primary: brand.lime,
  onPrimary: brand.ink,
  primaryLight: '#26261F',
  accent: '#5FBF8E',
  accentLight: '#16301F',
  limeText: brand.ink,
  error: '#F0705F',
  errorLight: '#3A1A15',
  pending: '#E3A64A',
  pendingLight: '#33270F',
  white: '#FFFFFF',
}

// Tipografías del diseño: Geist para todo y una serif cursiva para las palabras destacadas
export const fonts = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
  extrabold: 'Geist_800ExtraBold',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
}

// Campos con radio 14 y botones con radio 16, como en el diseño
export const radius = { sm: 8, md: 14, lg: 16, xl: 20 }

// Compatibilidad: el código que todavía importa `colors` recibe la paleta clara
export const colors = lightColors
