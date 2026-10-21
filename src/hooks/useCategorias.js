import { useEffect, useState } from 'react'
import { listarCategorias } from '../services/categoriasService'

/*
 * Categorías de equipo para los filtros y formularios del módulo Máquinas, ordenadas por nombre.
 * `status` es 'loading', 'success' o 'error': si fallan, el filtro queda sin opciones pero la pantalla sigue andando
 */
export function useCategorias() {
  const [state, setState] = useState({ status: 'loading', categorias: [] })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    listarCategorias({ signal })
      .then((categorias) => {
        if (signal.aborted) return
        const ordenadas = [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
        setState({ status: 'success', categorias: ordenadas })
      })
      .catch(() => {
        if (!signal.aborted) setState({ status: 'error', categorias: [] })
      })

    return () => controller.abort()
  }, [])

  return state
}
