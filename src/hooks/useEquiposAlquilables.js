import { useCallback, useEffect, useRef, useState } from 'react'
import { listarTodosLosEquiposDisponibles } from '../services/alquileresService'

/*
 * Equipos que se pueden elegir en el alta de un alquiler: todos los activos en estado "disponible" (sin paginar).
 * GET /equipos exige el módulo MAQUINAS: con `habilitado` en false no se pide nada (el back respondería 403).
 * `status` es 'loading', 'success' o 'error'. `isLoading` indica que hay un pedido en curso (también al recargar,
 * mientras se sigue viendo la lista anterior); `hasData` es false hasta la primera respuesta buena.
 * `retry` vuelve a pedir después de un error. `recargar` pide la lista de nuevo y la devuelve (la usa el alta cuando
 * el back responde que un equipo dejó de estar disponible, para saber cuáles); si falla, rechaza y deja la anterior
 */
export function useEquiposAlquilables({ habilitado = true } = {}) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ attempt: null, status: 'loading', equipos: null })
  const [recargando, setRecargando] = useState(false)
  const recarga = useRef(null)

  useEffect(() => {
    if (!habilitado) return undefined
    const controller = new AbortController()
    const { signal } = controller

    listarTodosLosEquiposDisponibles({ signal })
      .then((equipos) => {
        if (!signal.aborted) setState({ attempt, status: 'success', equipos })
      })
      .catch(() => {
        if (!signal.aborted) setState((current) => ({ attempt, status: 'error', equipos: current.equipos }))
      })

    return () => controller.abort()
  }, [attempt, habilitado])

  // Al desmontar, una recarga en curso ya no tiene a quién avisarle
  useEffect(() => () => recarga.current?.abort(), [])

  const retry = () => setAttempt((value) => value + 1)

  const recargar = useCallback(async () => {
    recarga.current?.abort()
    const controller = new AbortController()
    recarga.current = controller
    setRecargando(true)
    try {
      const equipos = await listarTodosLosEquiposDisponibles({ signal: controller.signal })
      if (!controller.signal.aborted) setState((current) => ({ ...current, status: 'success', equipos }))
      return equipos
    } finally {
      if (recarga.current === controller) {
        recarga.current = null
        setRecargando(false)
      }
    }
  }, [])

  const cargandoPrimera = state.attempt !== attempt
  return {
    status: cargandoPrimera ? 'loading' : state.status,
    equipos: state.equipos ?? [],
    isLoading: cargandoPrimera || recargando,
    hasData: state.equipos !== null,
    retry,
    recargar,
  }
}
