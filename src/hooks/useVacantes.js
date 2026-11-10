import { useEffect, useState } from 'react'
import { listarVacantes } from '../services/vacantesService'

/** @import { Vacante } from '../types/vacantes' */

/*
 * Vacantes del panel (GET /vacantes), activas e inactivas, en el orden en que las manda el back.
 * `status` es 'success' o 'error' de la última respuesta; `isLoading` indica que todavía no llegó la del pedido actual
 * (mientras tanto se conserva la lista anterior). `hasData` es false hasta la primera respuesta buena y después de un error.
 * `retry` vuelve a pedir después de un error; `reload` hace lo mismo después de un alta, una edición o un cambio de
 * estado, así el conteo y el orden quedan como los deja el back
 */
export function useVacantes() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ attempt: -1, status: 'success', vacantes: /** @type {Vacante[] | null} */ (null) })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    listarVacantes({ signal })
      .then((vacantes) => {
        if (!signal.aborted) setState({ attempt, status: 'success', vacantes })
      })
      .catch(() => {
        if (!signal.aborted) setState({ attempt, status: 'error', vacantes: null })
      })

    return () => controller.abort()
  }, [attempt])

  const retry = () => setAttempt((value) => value + 1)

  return {
    status: state.status,
    vacantes: state.vacantes ?? [],
    isLoading: state.attempt !== attempt,
    hasData: state.vacantes !== null,
    retry,
    reload: retry,
  }
}
