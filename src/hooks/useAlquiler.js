import { useEffect, useState } from 'react'
import { obtenerAlquiler } from '../services/alquileresService'

/** @import { AlquilerDetalle } from '../types/alquileres' */

/**
 * Carga un alquiler por su id (el de la URL), con su cliente, quién lo creó y sus equipos con los checklists de entrega
 * y devolución. `status` es 'loading', 'success', 'not-found' (404 o un id que no es un número) o 'error'; `retry` lo
 * vuelve a pedir pasando por la carga y `reload`, sin pasar por ella (después de una acción): mientras tanto se sigue
 * viendo el que estaba y, si falla, se lo conserva.
 * `inicial` es el detalle que ya trae quien navega hasta acá (el alta lo pide antes de ir): si es de este id se muestra
 * enseguida y se vuelve a pedir igual, porque el navegador conserva ese estado al recargar y podría estar viejo.
 * El resultado se guarda junto al id que lo pidió: al cambiar de alquiler se ve 'loading' sin mostrar el anterior
 * @param {string | undefined} id
 * @param {AlquilerDetalle | null} [inicial]
 */
export function useAlquiler(id, inicial = null) {
  const isValidId = /^\d+$/.test(id ?? '')
  const [result, setResult] = useState(() =>
    inicial && String(inicial.id) === id
      ? { id, status: 'success', alquiler: inicial }
      : { id: null, status: 'loading', alquiler: /** @type {AlquilerDetalle | null} */ (null) },
  )
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isValidId) return
    const controller = new AbortController()

    obtenerAlquiler(id, { signal: controller.signal })
      .then((alquiler) => {
        if (!controller.signal.aborted) setResult({ id, status: 'success', alquiler })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        const status = error.status === 404 ? 'not-found' : 'error'
        // Un 404 manda aunque hubiera uno mostrado; cualquier otro error conserva el que ya se veía
        setResult((actual) =>
          actual.id === id && actual.status === 'success' && status !== 'not-found'
            ? actual
            : { id, status, alquiler: null },
        )
      })

    return () => controller.abort()
  }, [id, isValidId, attempt])

  const retry = () => {
    setResult({ id: null, status: 'loading', alquiler: null })
    setAttempt((value) => value + 1)
  }

  const reload = () => setAttempt((value) => value + 1)

  if (!isValidId) return { status: 'not-found', alquiler: null, retry, reload }
  if (result.id !== id) return { status: 'loading', alquiler: null, retry, reload }
  return { status: result.status, alquiler: result.alquiler, retry, reload }
}
