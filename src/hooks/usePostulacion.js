import { useCallback, useEffect, useState } from 'react'
import { obtenerPostulacion } from '../services/postulacionesService'

/** @import { Postulacion } from '../types/postulaciones' */

/*
 * Carga una postulación por su id (el de la URL), para la ficha del postulante.
 * `status` es 'loading', 'success', 'not-found' (404, o 400 / un id que no es un número) o 'error'; `retry` la vuelve
 * a pedir. `actualizar` cambia la postulación que se muestra sin volver a pedirla: recibe una función con la actual
 * (el cambio de estado la usa para mostrar el nuevo al momento y para volver al anterior si falla).
 * El resultado se guarda junto al id que lo pidió: al cambiar de postulación se ve 'loading' sin mostrar la anterior
 */
export function usePostulacion(id) {
  const isValidId = /^\d+$/.test(id ?? '')
  const [result, setResult] = useState({
    id: null,
    status: 'loading',
    postulacion: /** @type {Postulacion | null} */ (null),
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isValidId) return
    const controller = new AbortController()

    obtenerPostulacion(id, { signal: controller.signal })
      .then((postulacion) => {
        if (!controller.signal.aborted) setResult({ id, status: 'success', postulacion })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        const status = error.status === 404 || error.status === 400 ? 'not-found' : 'error'
        setResult({ id, status, postulacion: null })
      })

    return () => controller.abort()
  }, [id, isValidId, attempt])

  const retry = () => {
    setResult({ id: null, status: 'loading', postulacion: null })
    setAttempt((value) => value + 1)
  }

  /** @param {(actual: Postulacion) => Postulacion} cambio */
  const actualizar = useCallback((cambio) => {
    setResult((actual) => (actual.postulacion ? { ...actual, postulacion: cambio(actual.postulacion) } : actual))
  }, [])

  if (!isValidId) return { status: 'not-found', postulacion: null, retry, actualizar }
  if (result.id !== id) return { status: 'loading', postulacion: null, retry, actualizar }
  return { status: result.status, postulacion: result.postulacion, retry, actualizar }
}
