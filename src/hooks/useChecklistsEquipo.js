import { useEffect, useState } from 'react'
import { listarChecklistsEquipo } from '../services/historialService'
import { CHECKLISTS_POR_PAGINA } from '../utils/historial'

/*
 * Una página de los checklists de un equipo según los filtros (los de useFiltrosHistorial).
 * `status` es 'success' o 'error' de la última respuesta; `isLoading` indica que todavía no llegó la de los
 * filtros actuales (mientras tanto se conserva la página anterior); `hasData`, que ya llegó alguna.
 * `retry` vuelve a pedir la misma página
 */
export function useChecklistsEquipo(equipoId, { desde, hasta, tipo, responsable, q, page }) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: null, status: 'success', checklists: [], meta: null })

  // Cada combinación de equipo y filtros (y cada reintento) es una consulta distinta
  const key = JSON.stringify([equipoId, desde, hasta, tipo, responsable, q, page, attempt])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const filtros = { desde, hasta, tipo, responsable, q, page, limit: CHECKLISTS_POR_PAGINA }

    listarChecklistsEquipo(equipoId, filtros, { signal })
      .then(({ checklists, meta }) => {
        if (!signal.aborted) setState({ key, status: 'success', checklists, meta })
      })
      .catch(() => {
        if (!signal.aborted) setState({ key, status: 'error', checklists: [], meta: null })
      })

    return () => controller.abort()
  }, [key, equipoId, desde, hasta, tipo, responsable, q, page])

  const retry = () => setAttempt((value) => value + 1)

  return { ...state, isLoading: state.key !== key, hasData: state.meta !== null, retry }
}
