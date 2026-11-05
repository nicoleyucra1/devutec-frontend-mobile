// Paleta de DEVUTEC (Fundamentos del diseño): Ink, Paper, Surface, Line, Escrow, Lime, Pending, Error y Progress.
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
  muted: '#6B6A63',
  border: brand.line,
  inputBorder: '#D6D1C6',
  // Botón principal: tinta con texto blanco
  primary: brand.ink,
  onPrimary: '#FFFFFF',
  primaryLight: '#ECE9E1',
  // Verde de confianza para estados positivos, enlaces y el pago protegido
  accent: brand.escrow,
  accentLight: '#E3EFE8',
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

// Tipografías del diseño: una sans gruesa para todo y una serif cursiva para las palabras destacadas
export const fonts = {
  regular: 'InterTight_400Regular',
  medium: 'InterTight_500Medium',
  semibold: 'InterTight_600SemiBold',
  bold: 'InterTight_700Bold',
  extrabold: 'InterTight_800ExtraBold',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
}

export const radius = { sm: 8, md: 12, lg: 16, xl: 20 }

// Compatibilidad: el código que todavía importa `colors` recibe la paleta clara
export const colors = lightColors
