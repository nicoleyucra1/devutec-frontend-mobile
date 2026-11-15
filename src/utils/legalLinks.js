import { Linking } from 'react-native'

// Páginas de Términos y condiciones y Política de privacidad, publicadas en la web
export const TERMS_URL = 'https://devutec.vercel.app/terminos'
export const PRIVACY_URL = 'https://devutec.vercel.app/privacidad'

// Abre la página en el navegador; si no se puede, no pasa nada
export const openLegalPage = (url) => Linking.openURL(url).catch(() => {})
