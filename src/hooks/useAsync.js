import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { errorMessage } from '../utils/errorMessage'

// Tipo de error para las pantallas que muestran un estado propio:
// 'timeout' si el servidor no respondió a tiempo, 'offline' si no hubo conexión, null para el resto
function errorKind(error) {
  if (error?.response) return null
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return 'timeout'
  if (error?.code === 'ERR_OFFLINE' || error?.code === 'ERR_NETWORK') return 'offline'
  return null
}

// Ejecuta una petición y maneja carga, error y cancelación (igual que en la web).
// Si cambian las dependencias, la petición anterior se cancela con AbortController.
export function useAsync(request, deps) {
  const [reloadCount, setReloadCount] = useState(0)
  const key = JSON.stringify([...deps, reloadCount])
  // Se guarda para qué "key" es el resultado; si no coincide con la actual, está cargando
  const [result, setResult] = useState({ key: null, data: null, error: null, status: null, kind: null })

  useEffect(() => {
    const controller = new AbortController()

    request({ signal: controller.signal })
      .then((data) => setResult({ key, data, error: null, status: null, kind: null }))
      .catch((error) => {
        if (axios.isCancel(error) || controller.signal.aborted) return
        setResult({
          key,
          data: null,
          error: errorMessage(error),
          status: error?.response?.status ?? null,
          kind: errorKind(error),
        })
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])
  const ready = result.key === key

  return {
    data: ready ? result.data : null,
    error: ready ? result.error : null,
    status: ready ? result.status : null,
    kind: ready ? result.kind : null,
    loading: !ready,
    reload,
  }
}
