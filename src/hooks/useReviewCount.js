import { userService } from '../services/userService'
import { useAsync } from './useAsync'

// Cuántas reseñas recibió una persona: se pide una sola y se lee el total de la página
export function useReviewCount(userId) {
  return useAsync((options) => userService.getReviews(userId, { size: 1 }, options).then((page) => page.totalElements), [userId])
}
