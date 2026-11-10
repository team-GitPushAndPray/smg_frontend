import { useEffect, useState } from 'react'
import { obtenerCliente } from '../services/clientesService'

/** @import { ClienteDetalle } from '../types/alquileres' */

/*
 * Carga un cliente por su id (el de la URL), con la cantidad de alquileres que tiene.
 * `status` es 'loading', 'success', 'not-found' (404 o un id que no es un número) o 'error'; `retry` lo vuelve a pedir.
 * `reload` lo vuelve a pedir sin pasar por 'loading' (después de editarlo o cambiarle el estado): mientras tanto se
 * sigue viendo el que estaba y, si falla, se lo conserva.
 * El resultado se guarda junto al id que lo pidió: al cambiar de cliente se ve 'loading' sin mostrar el anterior
 */
export function useCliente(id) {
  const isValidId = /^\d+$/.test(id ?? '')
  const [result, setResult] = useState({
    id: null,
    status: 'loading',
    cliente: /** @type {ClienteDetalle | null} */ (null),
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isValidId) return
    const controller = new AbortController()

    obtenerCliente(id, { signal: controller.signal })
      .then((cliente) => {
        if (!controller.signal.aborted) setResult({ id, status: 'success', cliente })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        const status = error.status === 404 ? 'not-found' : 'error'
        setResult((actual) => (actual.id === id && actual.status === 'success' ? actual : { id, status, cliente: null }))
      })

    return () => controller.abort()
  }, [id, isValidId, attempt])

  const retry = () => {
    setResult({ id: null, status: 'loading', cliente: null })
    setAttempt((value) => value + 1)
  }

  const reload = () => setAttempt((value) => value + 1)

  if (!isValidId) return { status: 'not-found', cliente: null, retry, reload }
  if (result.id !== id) return { status: 'loading', cliente: null, retry, reload }
  return { status: result.status, cliente: result.cliente, retry, reload }
}
