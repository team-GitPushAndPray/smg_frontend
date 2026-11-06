import { useEffect, useState } from 'react'
import { listarClientes } from '../services/clientesService'
import { ESTADOS_FILTRO_CLIENTES } from './useFiltrosClientes'

/** @import { Cliente } from '../types/alquileres' */

/*
 * Clientes según la búsqueda y el filtro de estado (los de useFiltrosClientes). El back los devuelve ordenados por
 * razón social y sin paginar; `q` busca solo en la razón social.
 * `status` es 'success' o 'error' de la última respuesta; `isLoading` indica que todavía no llegó la de los filtros
 * actuales (mientras tanto se conserva la lista anterior). `hasData` es false hasta la primera respuesta buena.
 * `retry` vuelve a pedir con los mismos filtros
 */
export function useClientes({ q, estado }) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: null, status: 'success', clientes: /** @type {Cliente[] | null} */ (null) })

  // Cada combinación de filtros (y cada reintento) es una consulta distinta
  const key = JSON.stringify([q, estado, attempt])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const filtros = { q, activo: ESTADOS_FILTRO_CLIENTES[estado].activo }

    listarClientes(filtros, { signal })
      .then((clientes) => {
        if (!signal.aborted) setState({ key, status: 'success', clientes })
      })
      .catch(() => {
        if (!signal.aborted) setState({ key, status: 'error', clientes: null })
      })

    return () => controller.abort()
  }, [key, q, estado])

  const retry = () => setAttempt((value) => value + 1)

  return {
    status: state.status,
    clientes: state.clientes ?? [],
    isLoading: state.key !== key,
    hasData: state.clientes !== null,
    retry,
  }
}
