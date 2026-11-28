// Archivos que el cliente adjuntó en el chat, para que el formulario los muestre y los una al proyecto al publicar.
// No se vacía al leerlo (la pantalla puede montarse más de una vez): se vacía al abrir el chat y al publicar.
let pending = []

export const assetStore = {
  set: (assets) => {
    pending = assets ?? []
  },
  get: () => pending,
  clear: () => {
    pending = []
  },
}
