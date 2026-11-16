import { applicationService } from '../services/applicationService'
import { projectService } from '../services/projectService'
import { useAsync } from './useAsync'

// Proyectos del cliente, cada uno con sus postulaciones (igual que en la web). El backend no manda cuántas
// postulaciones tiene un proyecto, así que se piden las de cada uno al mismo tiempo; un cliente tiene pocos.
// Si fallan las de un proyecto, queda con applications: null y el Inicio sigue.
export function useProjectsWithApplications() {
  return useAsync(async (options) => {
    const page = await projectService.getMine({ page: 1, size: 50 }, options)
    const applications = await Promise.all(
      page.content.map((project) => applicationService.getByProject(project.id, options).catch(() => null)),
    )
    return page.content.map((project, index) => ({ ...project, applications: applications[index] }))
  }, [])
}
