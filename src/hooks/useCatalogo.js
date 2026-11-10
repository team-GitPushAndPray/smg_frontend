import { useEffect, useState } from 'react'
import { getCatalogo } from '../services/catalogoService'

/*
 * Carga los equipos del catálogo público una sola vez.
 * `status` es 'loading', 'success' o 'error'; `retry` vuelve a pedirlos.
 */
export function useCatalogo() {
  const [state, setState] = useState({ status: 'loading', equipos: [] })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getCatalogo({ signal: controller.signal })
      .then((equipos) => {
        if (!controller.signal.aborted) setState({ status: 'success', equipos })
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error', equipos: [] })
      })

    return () => controller.abort()
  }, [attempt])

  const retry = () => {
    setState({ status: 'loading', equipos: [] })
    setAttempt((value) => value + 1)
  }

  return { ...state, retry }
}
