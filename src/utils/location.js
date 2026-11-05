import * as Location from 'expo-location'

// Pide permiso de ubicación y convierte las coordenadas en el nombre del distrito.
// Devuelve { district } o { error } con un mensaje para mostrar.
export async function detectDistrict() {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') {
    return { error: 'No diste permiso de ubicación. Puedes escribir el distrito a mano.' }
  }

  try {
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    const [address] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    })
    // En Perú el distrito suele venir en "district"; si no, se usa la zona más cercana disponible
    const district = address?.district || address?.subregion || address?.city
    if (!district) return { error: 'No pudimos reconocer tu distrito. Escríbelo a mano.' }
    const city = address?.city && address.city !== district ? `, ${address.city}` : ''
    return { district: `${district}${city}`.slice(0, 100) }
  } catch {
    return { error: 'No pudimos obtener tu ubicación. Revisa que el GPS esté activado.' }
  }
}
