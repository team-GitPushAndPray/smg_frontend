import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { MODULOS } from '../config/rutasPanel'
import { usePermiso } from '../hooks/usePermiso'
import { obtenerResumenAvisos } from '../services/avisosService'
import { AvisosContext } from './AvisosContext'

/** @import { ResumenAvisos } from '../types/avisos' */

/*
 * Resumen de avisos del panel (GET /avisos/resumen) para la campanita de la topbar, compartido con el centro de avisos
 * para que el badge baje apenas se atiende uno, sin recargar la página.
 * Se pide al entrar al panel, en cada cambio de sección (el pathname: cambiar de pestaña o de filtro no cuenta) y
 * cuando alguien llama a `refrescar()`. Sin websockets ni polling.
 * Solo si el rol tiene el módulo AVISOS (`habilitado`); si no, no se pide nada y `resumen` queda en null.
 * `resumen` es null hasta la primera respuesta buena; si una consulta falla se conserva el último (el badge no
 * desaparece por un corte de red). Un 403 (el rol perdió el módulo durante la sesión) deja de consultar hasta recargar
 */
export default function AvisosProvider({ children }) {
  const { puedeVer } = usePermiso(MODULOS.AVISOS)
  const { pathname } = useLocation()
  const [attempt, setAttempt] = useState(0)
  const [prohibido, setProhibido] = useState(false)
  const [resumen, setResumen] = useState(/** @type {ResumenAvisos | null} */ (null))

  const habilitado = puedeVer && !prohibido

  useEffect(() => {
    if (!habilitado) return
    const controller = new AbortController()
    const { signal } = controller

    obtenerResumenAvisos({ signal })
      .then((nuevo) => {
        if (!signal.aborted) setResumen(nuevo)
      })
      .catch((error) => {
        if (signal.aborted) return
        if (error?.status === 403) {
          setProhibido(true)
          setResumen(null)
        }
      })

    return () => controller.abort()
  }, [habilitado, pathname, attempt])

  const refrescar = useCallback(() => setAttempt((value) => value + 1), [])

  const value = useMemo(
    () => ({ habilitado, resumen: habilitado ? resumen : null, refrescar }),
    [habilitado, resumen, refrescar],
  )

  return <AvisosContext.Provider value={value}>{children}</AvisosContext.Provider>
}
