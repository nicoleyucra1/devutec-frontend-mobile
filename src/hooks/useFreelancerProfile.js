import { freelancerService } from '../services/freelancerService'
import { useAsync } from './useAsync'

export function useFreelancerProfile(userId) {
  return useAsync((options) => freelancerService.getByUserId(userId, options), [userId])
}
