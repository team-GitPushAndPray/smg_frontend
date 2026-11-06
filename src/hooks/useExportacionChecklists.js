import { useCallback, useEffect, useRef, useState } from 'react'
import { listarTodosLosChecklistsEquipo } from '../services/historialService'
import { useToast } from './useToast'

/*
 * Exportar a PDF los checklists de un equipo con los filtros aplicados. `exportar` pide todos los que los cumplen
 * (recorre todas las páginas, solo con GET) y deja listo el `informe` ({ checklists, filtros, emitido }) para
 * imprimir; `preparando` es true desde que se pide hasta que se cierra el diálogo, para no exportar dos veces.
 * `terminar` se llama al cerrar el diálogo. Si falla la red se avisa con un toast y se puede volver a intentar.
 * Los filtros y la fecha de emisión se toman al pedir: el PDF describe exactamente lo que trajo
 */
export function useExportacionChecklists(equipoId, filtros) {
  const { showToast } = useToast()
  const [preparando, setPreparando] = useState(false)
  const [informe, setInforme] = useState(null)
  const controllerRef = useRef(null)

  // Salir de la pantalla mientras se pide corta los pedidos que falten
  useEffect(() => () => controllerRef.current?.abort(), [])

  const exportar = useCallback(async () => {
    if (preparando) return
    const controller = new AbortController()
    controllerRef.current = controller
    setPreparando(true)

    const { desde, hasta, tipo, responsable, q } = filtros
    const aplicados = { desde, hasta, tipo, responsable, q }
    try {
      const checklists = await listarTodosLosChecklistsEquipo(equipoId, aplicados, { signal: controller.signal })
      if (controller.signal.aborted) return
      setInforme({ checklists, filtros: aplicados, emitido: new Date() })
    } catch {
      if (controller.signal.aborted) return
      setPreparando(false)
      showToast('No pudimos preparar el PDF. Revisá tu conexión e intentá de nuevo.')
    }
  }, [equipoId, filtros, preparando, showToast])

  const terminar = useCallback(() => {
    setInforme(null)
    setPreparando(false)
  }, [])

  return { preparando, informe, exportar, terminar }
}
