import { applicationService } from '../services/applicationService'
import { useAsync } from './useAsync'

// Postulaciones de un proyecto del cliente (GET /applications?projectId=). Solo se usa cuando quien mira
// es el dueño del proyecto: a cualquier otra persona el backend le responde 403.
export function useProjectApplicants(projectId) {
  return useAsync((options) => applicationService.getByProject(projectId, options), [projectId])
}
