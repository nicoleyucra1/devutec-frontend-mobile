import NetInfo from '@react-native-community/netinfo'

// Sin conexión: el celular no tiene red, o tiene wifi pero no llega a internet.
// isInternetReachable empieza en null mientras se comprueba; eso no cuenta como sin conexión.
export function isOfflineState(state) {
  return state.isConnected === false || state.isInternetReachable === false
}

// Último estado conocido, para que el cliente axios lo consulte sin esperar
let offline = false

NetInfo.addEventListener((state) => {
  offline = isOfflineState(state)
})

export const isOffline = () => offline
