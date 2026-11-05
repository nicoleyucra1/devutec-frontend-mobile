import { useCallback, useEffect, useRef, useState } from 'react'
import { projectService } from '../services/projectService'
import { errorMessage } from '../utils/errorMessage'

const PAGE_SIZE = 10

// Lista paginada con scroll infinito: carga la página 1 y va sumando las siguientes al llegar al final.
// Si cambian los filtros, empieza de nuevo y cancela la petición anterior.
export function useProjectFeed(filters) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('loading') // loading | idle | more | refreshing | error
  const [error, setError] = useState(null)
  const controllerRef = useRef(null)
  const key = JSON.stringify(filters)

  const load = useCallback(
    async (nextPage, mode) => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller
      setStatus(mode)
      setError(null)
      try {
        const data = await projectService.getAll(
          { ...JSON.parse(key), page: nextPage, size: PAGE_SIZE },
          { signal: controller.signal },
        )
        setItems((prev) => (nextPage === 1 ? data.content : [...prev, ...data.content]))
        setPage(nextPage)
        setTotalPages(data.totalPages)
        setStatus('idle')
      } catch (err) {
        if (controller.signal.aborted) return
        setError(errorMessage(err))
        setStatus('error')
      }
    },
    [key],
  )

  useEffect(() => {
    load(1, 'loading')
    return () => controllerRef.current?.abort()
  }, [load])

  const hasMore = page < totalPages

  return {
    items,
    error,
    loading: status === 'loading',
    loadingMore: status === 'more',
    refreshing: status === 'refreshing',
    hasMore,
    loadMore: () => {
      if (status === 'idle' && hasMore) load(page + 1, 'more')
    },
    refresh: () => load(1, 'refreshing'),
    retry: () => load(page === 0 ? 1 : page + 1, page === 0 ? 'loading' : 'more'),
  }
}
