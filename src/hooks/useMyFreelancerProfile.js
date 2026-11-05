import { freelancerService } from '../services/freelancerService'
import { useAsync } from './useAsync'

export function useMyFreelancerProfile() {
  return useAsync((options) => freelancerService.getMine(options), [])
}
