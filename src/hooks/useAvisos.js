import { useEffect, useState } from 'react'
import { listarAvisos } from '../services/avisosService'

/** @import { Aviso, FiltrosAvisos } from '../types/avisos' */

/**
 * Avisos que cumplen una consulta a GET /avisos, en el orden en que los manda el back. Con `consulta` null no se pide
 * nada: así la pestaña que no se está viendo no consulta al back (y conserva su última lista para cuando se vuelva).
 * `status` es 'success', 'error' (sin conexión o falla del back) o 'forbidden' (403: el rol no tiene el módulo AVISOS)
 * de la última respuesta; `isLoading` indica que todavía no llegó la de la consulta actual (mientras tanto se conserva
 * la lista anterior). `hasData` es false hasta la primera respuesta buena. `retry` vuelve a pedir la misma consulta
 * @param {FiltrosAvisos | null} consulta
 */
export function useAvisos(consulta) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({
    key: null,
    status: 'success',
    avisos: /** @type {Aviso[] | null} */ (null),
  })

  // La consulta viaja serializada: cada combinación de filtros (y cada reintento) es una clave distinta
  const consultaKey = consulta ? JSON.stringify(consulta) : null
  const key = consultaKey ? JSON.stringify([consultaKey, attempt]) : null

  useEffect(() => {
    if (!consultaKey) return
    const controller = new AbortController()
    const { signal } = controller

    listarAvisos(JSON.parse(consultaKey), { signal })
      .then((avisos) => {
        if (!signal.aborted) setState({ key, status: 'success', avisos })
      })
      .catch((error) => {
        if (signal.aborted) return
        // En un error se descarta la lista anterior: no se muestra la de otro filtro como si fuera la de este
        setState({ key, status: error?.status === 403 ? 'forbidden' : 'error', avisos: null })
      })

    return () => controller.abort()
  }, [key, consultaKey])

  const retry = () => setAttempt((value) => value + 1)

  return {
    status: state.status,
    avisos: state.avisos ?? [],
    isLoading: key !== null && state.key !== key,
    hasData: state.avisos !== null,
    retry,
  }
}
