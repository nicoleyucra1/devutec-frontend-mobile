import api from './api'

export const userService = {
  // Devuelve { id, nombre, email, rol } del usuario con sesión
  getMe: () => api.get('/users/me').then((res) => res.data),
}
