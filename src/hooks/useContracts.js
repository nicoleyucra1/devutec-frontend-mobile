import { contractService } from '../services/contractService'
import { useAsync } from './useAsync'

// Contratos del usuario con sesión, como cliente o como freelancer (GET /contracts/me)
export function useMyContracts() {
  return useAsync((options) => contractService.getMine(options), [])
}

// Un contrato por id (GET /contracts/{id}); el backend solo lo muestra a sus participantes
export function useContract(id) {
  return useAsync((options) => contractService.getById(id, options), [id])
}