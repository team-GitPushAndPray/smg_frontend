import { useCallback, useEffect, useState } from 'react'
import { listarRegistro } from '../services/notificacionesService'
import { ENVIOS_POR_PAGINA, FILTROS_CANAL_ENVIO, FILTROS_ESTADO_ENVIO } from '../utils/notificaciones'

/** @import { RegistroNotificacion } from '../types/notificaciones' */

/*
 * Una página del registro de envíos (GET /notificaciones/registro) según los filtros de useFiltrosRegistro, del más
 * nuevo al más viejo. Si llega tarde la respuesta de un filtro anterior, se descarta.
 * `status` es 'success' o 'error' de la última respuesta; `isLoading` indica que todavía no llegó la del pedido actual
 * (mientras tanto se conserva la página anterior). `hasData` es false hasta la primera respuesta buena y después de
 * un error. `recargar` vuelve a pedir la misma página: es el botón "Actualizar" y el "Reintentar" del error
 * @param {{ estado: string, canal: string, page: number }} filtros
 */
export function useRegistroEnvios({ estado, canal, page }) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({
    key: '',
    status: 'success',
    envios: /** @type {RegistroNotificacion[]} */ ([]),
    total: /** @type {number | null} */ (null),
  })

  // Cada combinación de filtros (y cada recarga) es una consulta distinta
  const key = JSON.stringify([estado, canal, page, attempt])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const filtros = {
      estado: FILTROS_ESTADO_ENVIO[estado]?.estado,
      canal: FILTROS_CANAL_ENVIO[canal]?.canal,
      page,
      limit: ENVIOS_POR_PAGINA,
    }

    listarRegistro(filtros, { signal })
      .then(({ data, total }) => {
        if (!signal.aborted) setState({ key, status: 'success', envios: data, total })
      })
      .catch(() => {
        if (!signal.aborted) setState({ key, status: 'error', envios: [], total: null })
      })

    return () => controller.abort()
  }, [key, estado, canal, page])

  const recargar = useCallback(() => setAttempt((value) => value + 1), [])

  return {
    status: state.status,
    envios: state.envios,
    total: state.total ?? 0,
    isLoading: state.key !== key,
    hasData: state.total !== null,
    recargar,
  }
}
