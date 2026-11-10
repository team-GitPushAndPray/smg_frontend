import { useEffect, useState } from 'react'
import { listarAlquileresDeEquipo } from '../services/alquileresService'

/** @import { AlquilerDeEquipo } from '../types/alquileres' */

/*
 * Historial de alquileres de un equipo: todos en los que participó, de cualquier estado, del más nuevo al más viejo, con
 * las fechas de entrega y devolución de ese equipo (listarAlquileresDeEquipo). Exige el módulo ALQUILERES: la pestaña
 * que lo usa solo se monta si el usuario lo tiene.
 * `status` es 'loading', 'success' o 'error'; `retry` lo vuelve a pedir.
 * El resultado se guarda junto al id que lo pidió: al cambiar de equipo se ve 'loading' sin mostrar los del anterior
 */
export function useAlquileresEquipo(equipoId) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({
    key: null,
    status: 'loading',
    alquileres: /** @type {AlquilerDeEquipo[]} */ ([]),
  })

  const key = JSON.stringify([equipoId, attempt])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    listarAlquileresDeEquipo(equipoId, { signal })
      .then((alquileres) => {
        if (!signal.aborted) setResult({ key, status: 'success', alquileres })
      })
      .catch(() => {
        if (!signal.aborted) setResult({ key, status: 'error', alquileres: [] })
      })

    return () => controller.abort()
  }, [key, equipoId])

  const retry = () => setAttempt((value) => value + 1)

  if (result.key !== key) return { status: 'loading', alquileres: [], retry }
  return { status: result.status, alquileres: result.alquileres, retry }
}
