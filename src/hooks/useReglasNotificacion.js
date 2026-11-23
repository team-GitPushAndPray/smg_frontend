import { useCallback, useEffect, useState } from 'react'
import { listarReglas } from '../services/notificacionesService'

/** @import { ReglaNotificacion } from '../types/notificaciones' */

/*
 * Reglas de notificación (GET /notificaciones/reglas), activas e inactivas, en el orden en que las manda el back.
 * `status` es 'success' o 'error' de la última respuesta; `isLoading` indica que todavía no llegó la del pedido actual
 * (mientras tanto se conserva la lista anterior). `hasData` es false hasta la primera respuesta buena y después de un
 * error. `retry` vuelve a pedir después de un error; `reload`, después de un alta o una edición.
 * `reemplazarRegla(id, cambios)` cambia una regla en la lista sin ir al back: lo usa el switch de "Activa" para verse
 * al instante (y para volver atrás si el PATCH falla)
 */
export function useReglasNotificacion() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ attempt: -1, status: 'success', reglas: /** @type {ReglaNotificacion[] | null} */ (null) })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    listarReglas({ signal })
      .then((reglas) => {
        if (!signal.aborted) setState({ attempt, status: 'success', reglas })
      })
      .catch(() => {
        if (!signal.aborted) setState({ attempt, status: 'error', reglas: null })
      })

    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  const reemplazarRegla = useCallback((id, cambios) => {
    setState((current) => ({
      ...current,
      reglas: current.reglas?.map((regla) => (regla.id === id ? { ...regla, ...cambios } : regla)) ?? null,
    }))
  }, [])

  return {
    status: state.status,
    reglas: state.reglas ?? [],
    isLoading: state.attempt !== attempt,
    hasData: state.reglas !== null,
    retry,
    reload: retry,
    reemplazarRegla,
  }
}
