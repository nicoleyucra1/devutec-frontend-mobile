import { createContext } from 'react'

// true cuando la animación de entrada empezó a salir y la app ya se ve.
// Por defecto es true para que las pantallas animen aunque no haya animación de entrada.
export const IntroContext = createContext(true)
