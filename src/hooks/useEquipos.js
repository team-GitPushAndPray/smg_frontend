import { useEffect, useState } from 'react'
import { listarEquipos } from '../services/equiposService'

// Equipos por página del inventario
export const EQUIPOS_POR_PAGINA = 10

/*
 * Una página del inventario según los filtros (los de useFiltrosInventario). Sin el switch de bajas
 * se piden solo los activos: el listado no trae `activo`, así que no se pueden mezclar.
 * `status` es 'success' o 'error' de la última respuesta; `isLoading` indica que todavía no llegó la de los
 * filtros actuales (mientras tanto se conserva la página anterior). `dadosDeBaja` dice si los equipos que se están
 * mostrando son los dados de baja (puede no coincidir con el switch mientras carga). `retry` vuelve a pedir la misma página
 */
export function useEquipos({ search, tipo, estado, categoriaId, bajas, page }) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: null, status: 'success', equipos: [], meta: null, dadosDeBaja: false })

  // Cada combinación de filtros (y cada reintento) es una consulta distinta
  const key = JSON.stringify([search, tipo, estado, categoriaId, bajas, page, attempt])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const filtros = { search, tipo, estado, categoriaId, activo: !bajas, page, limit: EQUIPOS_POR_PAGINA }

    listarEquipos(filtros, { signal })
      .then(({ equipos, meta }) => {
        if (!signal.aborted) setState({ key, status: 'success', equipos, meta, dadosDeBaja: bajas })
      })
      .catch(() => {
        if (!signal.aborted) setState({ key, status: 'error', equipos: [], meta: null, dadosDeBaja: bajas })
      })

    return () => controller.abort()
  }, [key, search, tipo, estado, categoriaId, bajas, page])

  const retry = () => setAttempt((value) => value + 1)

  return { ...state, isLoading: state.key !== key, hasData: state.meta !== null, retry }
}
