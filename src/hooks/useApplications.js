import { applicationService } from '../services/applicationService'
import { useAsync } from './useAsync'

//Postulaciones del freelancer con sesión (GET /applications/me)
export function useMyApplications() {
  return useAsync((options) => applicationService.getMine(options), [])
}