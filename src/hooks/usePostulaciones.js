import { useEffect, useState } from 'react'
import { listarPostulaciones } from '../services/postulacionesService'

/** @import { FiltrosPostulaciones, Postulacion } from '../types/postulaciones' */

/*
 * Postulaciones de la bandeja (GET /postulaciones) con los filtros de la URL, en el orden en que las manda el back.
 * Cada cambio de filtro vuelve a pedir; si llega tarde la respuesta de un filtro anterior, se descarta.
 * `status` es 'success' o 'error' de la última respuesta; `isLoading` indica que todavía no llegó la del pedido actual
 * (mientras tanto se conserva la lista anterior). `hasData` es false hasta la primera respuesta buena y después de un
 * error. `retry` vuelve a pedir con los mismos filtros
 * @param {FiltrosPostulaciones} filtros
 */
export function usePostulaciones({ vacanteId, estado }) {
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${vacanteId ?? ''}|${estado}|${attempt}`
  const [state, setState] = useState({
    key: '',
    status: 'success',
    postulaciones: /** @type {Postulacion[] | null} */ (null),
  })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    listarPostulaciones({ vacanteId, estado }, { signal })
      .then((postulaciones) => {
        if (!signal.aborted) setState({ key: requestKey, status: 'success', postulaciones })
      })
      .catch(() => {
        if (!signal.aborted) setState({ key: requestKey, status: 'error', postulaciones: null })
      })

    return () => controller.abort()
  }, [vacanteId, estado, requestKey])

  return {
    status: state.status,
    postulaciones: state.postulaciones ?? [],
    isLoading: state.key !== requestKey,
    hasData: state.postulaciones !== null,
    retry: () => setAttempt((value) => value + 1),
  }
}
