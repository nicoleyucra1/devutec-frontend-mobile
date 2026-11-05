import axios from 'axios'

// Cliente aparte para la API pública de GitHub: no usa "api" para no mandarle nuestro token a GitHub
const github = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 10000,
  headers: { Accept: 'application/vnd.github+json' },
})

export const githubService = {
  // Repos públicos del usuario, los actualizados más recientemente primero.
  // Sin token, GitHub permite 60 consultas por hora desde la misma IP.
  async getRepos(username, { limit = 6, signal } = {}) {
    const { data } = await github.get(`/users/${encodeURIComponent(username)}/repos`, {
      params: { sort: 'updated', per_page: limit, type: 'owner' },
      signal,
    })
    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url,
      fork: repo.fork,
    }))
  },
}
