import { applicationService } from '../services/applicationService'
import { contractService } from '../services/contractService'
import { projectService } from '../services/projectService'
import { useAsync } from './useAsync'

// Postulaciones del freelancer con lo que la postulación no trae (igual que en la web): el cliente y el
// presupuesto del proyecto, y el contrato si ya la aceptaron. Los proyectos se piden al mismo tiempo;
// si alguno falla, esa tarjeta queda con project: null.
export function useMyApplicationsWithProjects() {
  return useAsync(async (options) => {
    const [applications, contracts] = await Promise.all([
      applicationService.getMine(options),
      contractService.getMine(options).catch(() => []),
    ])
    const projectIds = [...new Set(applications.map((application) => application.projectId))]
    const projects = await Promise.all(projectIds.map((id) => projectService.getById(id, options).catch(() => null)))
    const projectById = new Map(projectIds.map((id, index) => [id, projects[index]]))

    return applications.map((application) => ({
      ...application,
      project: projectById.get(application.projectId) ?? null,
      contract: contracts.find((contract) => contract.projectId === application.projectId) ?? null,
    }))
  }, [])
}
