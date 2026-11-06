import { useEffect, useState } from 'react'
import { listarAlquileres } from '../services/alquileresService'

/** @import { AlquilerListado } from '../types/alquileres' */

/*
 * Historial de alquileres de un cliente (el id de la URL): todos, de cualquier estado (también finalizados y anulados),
 * del más nuevo al más viejo, que es el orden en que los manda el back sin `por_vencer`.
 * `status` es 'loading', 'success' o 'error'; `retry` lo vuelve a pedir. Con un id que no es un número no se pide nada
 * (la página ya muestra "Cliente no encontrado").
 * El resultado se guarda junto al id que lo pidió: al cambiar de cliente se ve 'loading' sin mostrar los del anterior
 */
export function useAlquileresCliente(clienteId) {
  const isValidId = /^\d+$/.test(clienteId ?? '')
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({
    key: null,
    status: 'loading',
    alquileres: /** @type {AlquilerListado[]} */ ([]),
  })

  const key = JSON.stringify([clienteId, attempt])

  useEffect(() => {
    if (!isValidId) return
    const controller = new AbortController()
    const { signal } = controller

    listarAlquileres({ cliente_id: Number(clienteId) }, { signal })
      .then((alquileres) => {
        if (!signal.aborted) setResult({ key, status: 'success', alquileres })
      })
      .catch(() => {
        if (!signal.aborted) setResult({ key, status: 'error', alquileres: [] })
      })

    return () => controller.abort()
  }, [key, clienteId, isValidId])

  const retry = () => setAttempt((value) => value + 1)

  if (!isValidId || result.key !== key) return { status: 'loading', alquileres: [], retry }
  return { status: result.status, alquileres: result.alquileres, retry }
}
