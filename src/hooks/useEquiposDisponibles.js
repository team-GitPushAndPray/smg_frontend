import { useEffect, useState } from 'react'
import { listarEquiposDisponibles } from '../services/alquileresService'

/*
 * Cantidad de equipos activos en estado "disponible": el mismo número que muestra Máquinas con ese filtro. Se pide una
 * página de un solo equipo y se lee el total. GET /equipos exige el módulo MAQUINAS: usarlo solo si el rol lo tiene
 * (sin él, el back responde 403).
 * `status` es 'loading', 'success' o 'error'; `retry` lo vuelve a pedir
 */
export function useEquiposDisponibles() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ attempt: null, status: 'loading', total: null })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    listarEquiposDisponibles({ page: 1, limit: 1 }, { signal })
      .then(({ meta }) => {
        if (!signal.aborted) setState({ attempt, status: 'success', total: meta.total })
      })
      .catch(() => {
        if (!signal.aborted) setState({ attempt, status: 'error', total: null })
      })

    return () => controller.abort()
  }, [attempt])

  const retry = () => setAttempt((value) => value + 1)

  if (state.attempt !== attempt) return { status: 'loading', total: null, retry }
  return { status: state.status, total: state.total, retry }
}
