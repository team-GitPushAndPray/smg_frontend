import { useEffect, useState } from 'react'
import { getVacantesPublicas } from '../services/vacantesService'

/*
 * Carga las vacantes activas para "Trabajá con nosotros".
 * `status` es 'loading', 'success' o 'error'; `retry` las vuelve a pedir mostrando la carga y `recargar`, sin ella
 * (si una búsqueda se cerró mientras alguien se postulaba): si la recarga falla, queda la lista que había
 */
export function useVacantesPublicas() {
  const [state, setState] = useState({ status: 'loading', vacantes: [] })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getVacantesPublicas({ signal: controller.signal })
      .then((vacantes) => {
        if (!controller.signal.aborted) setState({ status: 'success', vacantes })
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setState((current) => (current.status === 'success' ? current : { status: 'error', vacantes: [] }))
      })

    return () => controller.abort()
  }, [attempt])

  const retry = () => {
    setState({ status: 'loading', vacantes: [] })
    setAttempt((value) => value + 1)
  }

  const recargar = () => setAttempt((value) => value + 1)

  return { ...state, retry, recargar }
}
