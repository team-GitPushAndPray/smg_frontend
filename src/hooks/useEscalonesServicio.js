import { useCallback, useEffect, useState } from 'react'
import { listarEscalonesServicio } from '../services/escalonesServicioService'

/** @import { EscalonServicioDetalle } from '../types/avisos' */

/*
 * Tipos de service de la pestaña Servicios. `status` es 'loading', 'success' o 'error'. `retry` vuelve a pedirlos
 * mostrando la carga. `actualizarEscalon` reemplaza uno con lo que devolvió el back al editarlo, sin volver a pedir la
 * lista (el orden no cambia: las horas son fijas)
 */
export function useEscalonesServicio() {
  const [state, setState] = useState(
    /** @type {{ status: 'loading' | 'success' | 'error', escalones: EscalonServicioDetalle[] }} */ ({
      status: 'loading',
      escalones: [],
    }),
  )
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    listarEscalonesServicio({ signal })
      .then((escalones) => {
        if (!signal.aborted) setState({ status: 'success', escalones })
      })
      .catch(() => {
        if (!signal.aborted) setState({ status: 'error', escalones: [] })
      })

    return () => controller.abort()
  }, [attempt])

  const retry = () => {
    setState({ status: 'loading', escalones: [] })
    setAttempt((value) => value + 1)
  }

  const actualizarEscalon = useCallback((/** @type {EscalonServicioDetalle} */ escalon) => {
    setState((current) => ({
      ...current,
      escalones: current.escalones.map((actual) => (actual.id === escalon.id ? { ...actual, ...escalon } : actual)),
    }))
  }, [])

  return { ...state, retry, actualizarEscalon }
}
