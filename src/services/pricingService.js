import api from './api'

// Copiloto "Antes de postular": horas estimadas, cuánto cobrar y lo que suele olvidarse. No usa IA:
// el backend lo calcula con la tabla de horas y los proyectos terminados.
export const pricingService = {
  async estimateProject(projectId, { signal } = {}) {
    const { data } = await api.get(`/pricing/projects/${projectId}`, { signal })
    return data
  },
}
