// Guarda el proyecto que armó el asistente para que la pantalla "Nuevo proyecto" lo use al abrirse.
// Es un objeto grande (precio, etapas, funcionalidades), así que no va en los parámetros de la ruta.
let pending = null

export const draftStore = {
  set: (draft) => {
    pending = draft
  },
  // Lo entrega una sola vez: si el cliente vuelve a abrir el formulario a mano, empieza vacío
  take: () => {
    const draft = pending
    pending = null
    return draft
  },
}
