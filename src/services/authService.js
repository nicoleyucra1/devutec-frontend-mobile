import api from './api'

// Endpoints de /api/v1/auth. Todos devuelven { accessToken, refreshToken, email, rol }.
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials).then((res) => res.data),

  // data: { nombre, email, password, rol } con rol CLIENT o FREELANCER
  register: (data) => api.post('/auth/register', data).then((res) => res.data),

  // data: { idToken, rol? }. Si la cuenta de Google es nueva y no se manda rol, responde 422
  google: (data) => api.post('/auth/google', data).then((res) => res.data),
}
