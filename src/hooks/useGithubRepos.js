import { githubService } from '../services/githubService'
import { useAsync } from './useAsync'

// Sin usuario de GitHub no se hace la consulta y se devuelve una lista vacía
export function useGithubRepos(username) {
  return useAsync(
    (options) => (username ? githubService.getRepos(username, options) : Promise.resolve([])),
    [username],
  )
}
