import { useEffect, useState } from 'react'
import { obtenerFormularioChecklistAlquiler } from '../services/alquileresService'
import { adaptarFormularioChecklistAlquiler, esTipoChecklistAlquiler } from '../utils/alquileres'

/** @import { TipoChecklistAlquiler } from '../types/alquileres' */

/**
 * Carga el formulario del checklist de entrega o devolución de un equipo alquilado (los ids y el tipo de la URL), ya
 * adaptado para el asistente (adaptarFormularioChecklistAlquiler).
 * `status` es 'loading', 'success', 'not-found' (404: el equipo no es del alquiler, o la URL no sirve: ids que no son
 * números o un tipo que no es ENTREGA ni DEVOLUCION), 'conflicto' (409: ya se hizo, falta la entrega o el alquiler
 * no está en curso; `mensaje` trae el del back), 'offline' (no se pudo conectar) o 'error'. `retry` lo vuelve a pedir.
 * Sin conexión, también se reintenta solo cuando vuelve la red.
 * El resultado se guarda junto a la URL que lo pidió: al cambiar de equipo o de tipo se ve 'loading' sin mostrar el anterior
 * @param {string | undefined} id
 * @param {string | undefined} equipoId
 * @param {string | null} tipo
 */
export function useFormularioChecklistAlquiler(id, equipoId, tipo) {
  const pedido = `${id}:${equipoId}:${tipo}`
  const esValido = /^\d+$/.test(id ?? '') && /^\d+$/.test(equipoId ?? '') && esTipoChecklistAlquiler(tipo)
  const [result, setResult] = useState({ pedido: null, status: 'loading', formulario: null, mensaje: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!esValido) return
    const controller = new AbortController()
    const tipoValido = /** @type {TipoChecklistAlquiler} */ (tipo)

    obtenerFormularioChecklistAlquiler(id, equipoId, tipoValido, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        setResult({ pedido, status: 'success', formulario: adaptarFormularioChecklistAlquiler(data, tipoValido), mensaje: null })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        let status = 'error'
        if (error.status === 404 || error.status === 400) status = 'not-found'
        else if (error.status === 409) status = 'conflicto'
        else if (error.status === 0) status = 'offline'
        setResult({ pedido, status, formulario: null, mensaje: error.message ?? null })
      })

    return () => controller.abort()
  }, [id, equipoId, tipo, pedido, esValido, attempt])

  const retry = () => {
    setResult({ pedido: null, status: 'loading', formulario: null, mensaje: null })
    setAttempt((value) => value + 1)
  }

  const isOffline = result.pedido === pedido && result.status === 'offline'

  useEffect(() => {
    if (!isOffline) return
    const onOnline = () => {
      setResult({ pedido: null, status: 'loading', formulario: null, mensaje: null })
      setAttempt((value) => value + 1)
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [isOffline])

  if (!esValido) return { status: 'not-found', formulario: null, mensaje: null, retry }
  if (result.pedido !== pedido) return { status: 'loading', formulario: null, mensaje: null, retry }
  return { status: result.status, formulario: result.formulario, mensaje: result.mensaje, retry }
}
