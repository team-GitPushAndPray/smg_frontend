import { useEffect, useState } from 'react'
import { listarAlquileres } from '../services/alquileresService'

/** @import { AlquilerListado, FiltrosAlquileres } from '../types/alquileres' */

/**
 * Alquileres que cumplen una consulta a GET /alquileres (sin paginar), en el orden en que los manda el back. Con
 * `consulta` null no se pide nada: así una pestaña que no se está viendo no consulta al back.
 * `status` es 'success' o 'error' de la última respuesta; `isLoading` indica que todavía no llegó la de la consulta
 * actual (mientras tanto se conserva la lista anterior). `hasData` es false hasta la primera respuesta buena.
 * `retry` vuelve a pedir la misma consulta
 * @param {FiltrosAlquileres | null} consulta
 */
export function useAlquileres(consulta) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({
    key: null,
    status: 'success',
    alquileres: /** @type {AlquilerListado[] | null} */ (null),
  })

  // La consulta viaja serializada: cada combinación de filtros (y cada reintento) es una clave distinta
  const consultaKey = consulta ? JSON.stringify(consulta) : null
  const key = consultaKey ? JSON.stringify([consultaKey, attempt]) : null

  useEffect(() => {
    if (!consultaKey) return
    const controller = new AbortController()
    const { signal } = controller

    listarAlquileres(JSON.parse(consultaKey), { signal })
      .then((alquileres) => {
        if (!signal.aborted) setState({ key, status: 'success', alquileres })
      })
      .catch(() => {
        if (!signal.aborted) setState({ key, status: 'error', alquileres: null })
      })

    return () => controller.abort()
  }, [key, consultaKey])

  const retry = () => setAttempt((value) => value + 1)

  return {
    status: state.status,
    alquileres: state.alquileres ?? [],
    isLoading: key !== null && state.key !== key,
    hasData: state.alquileres !== null,
    retry,
  }
}
