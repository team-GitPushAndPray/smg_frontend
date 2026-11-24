import { useCallback, useEffect, useRef, useState } from 'react'
import { generarResumenVacante, getResumenVacante } from '../services/vacantesService'
import { getErrorResumenVacante } from '../utils/vacantes'
import { useToast } from './useToast'

/** @import { ResumenVacante } from '../types/vacantes' */

/*
 * Resumen con IA de la vacante elegida en la bandeja (GET /vacantes/:id/resumen-ia), y "Generar" / "Regenerar"
 * (POST, que puede tardar unos segundos). Con `vacanteId` null no pide nada.
 * `status`:
 * - 'loading': todavía no llegó el resumen de esta vacante (al cambiar de vacante no se muestra el de la anterior).
 * - 'success': llegó; `resumen` es null si la vacante todavía no tiene uno.
 * - 'error': falló el pedido (`retry` vuelve a pedir).
 * - 'not-found': la vacante no existe (un vacante_id viejo en la URL).
 * `recargar` vuelve a pedir sin pasar por 'loading' (se sigue viendo el resumen actual): se usa al terminar "Analizar
 * pendientes", para que aparezca "Desactualizado". Si llega tarde la respuesta de otra vacante, se descarta.
 * `generando` es true mientras se genera el de esta vacante. Si se cambia de vacante mientras tanto, el resultado no
 * se muestra (al volver se pide de nuevo y ya está guardado) y su error no se avisa. Si falla, el error va en un aviso
 * y el resumen anterior (si había) sigue en pantalla
 * @param {number | null} vacanteId
 */
export function useResumenVacante(vacanteId) {
  const { showToast } = useToast()
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${vacanteId ?? ''}|${attempt}`
  const [state, setState] = useState({
    key: '',
    vacanteId: /** @type {number | null} */ (null),
    status: 'success',
    resumen: /** @type {ResumenVacante | null} */ (null),
  })
  // Vacantes con un "Generar" en curso: se puede cambiar de vacante y generar otra mientras tanto. La ref es la fuente
  // de verdad (evita dos POST de la misma vacante con dos clics seguidos); el estado, la copia para pintar
  const enCursoRef = useRef(/** @type {Set<number>} */ (new Set()))
  const [generandoIds, setGenerandoIds] = useState(/** @type {Set<number>} */ (new Set()))
  // Sube con cada resumen generado: un GET que salió antes no pisa con el resumen viejo al que acaba de llegar
  const versionRef = useRef(0)

  // Vacante y pedido en pantalla, para que el POST (que no vive en el efecto) sepa si su respuesta todavía sirve
  const actualRef = useRef({ vacanteId, requestKey })
  const montadoRef = useRef(true)

  useEffect(() => {
    actualRef.current = { vacanteId, requestKey }
  }, [vacanteId, requestKey])

  useEffect(() => {
    montadoRef.current = true
    return () => {
      montadoRef.current = false
    }
  }, [])

  useEffect(() => {
    if (vacanteId === null) return undefined
    const controller = new AbortController()
    const { signal } = controller
    const version = versionRef.current

    getResumenVacante(vacanteId, { signal })
      .then((resumen) => {
        if (signal.aborted) return
        if (versionRef.current !== version) {
          setState((actual) => (actual.vacanteId === vacanteId ? { ...actual, key: requestKey } : actual))
          return
        }
        setState({ key: requestKey, vacanteId, status: 'success', resumen })
      })
      .catch((error) => {
        if (signal.aborted) return
        const status = error.status === 404 ? 'not-found' : 'error'
        setState({ key: requestKey, vacanteId, status, resumen: null })
      })

    return () => controller.abort()
  }, [vacanteId, requestKey])

  const generar = useCallback(async () => {
    const id = actualRef.current.vacanteId
    if (id === null || enCursoRef.current.has(id)) return
    enCursoRef.current.add(id)
    setGenerandoIds(new Set(enCursoRef.current))
    const sigueEnPantalla = () => montadoRef.current && actualRef.current.vacanteId === id

    try {
      const resumen = await generarResumenVacante(id)
      versionRef.current += 1
      if (sigueEnPantalla()) {
        setState({ key: actualRef.current.requestKey, vacanteId: id, status: 'success', resumen })
      }
    } catch (error) {
      const mensaje = getErrorResumenVacante(error)
      if (mensaje && sigueEnPantalla()) showToast(mensaje)
    } finally {
      enCursoRef.current.delete(id)
      if (montadoRef.current) setGenerandoIds(new Set(enCursoRef.current))
    }
  }, [showToast])

  const recargar = useCallback(() => setAttempt((value) => value + 1), [])

  // Lo que hay en pantalla es de otra vacante (o todavía de ninguna): se espera la respuesta de esta
  const esDeOtraVacante = state.vacanteId !== vacanteId
  const status = esDeOtraVacante ? 'loading' : state.status

  return {
    status,
    resumen: esDeOtraVacante ? null : state.resumen,
    // Recargando con el resumen ya en pantalla (después de "Analizar pendientes" o de un error)
    isRefreshing: !esDeOtraVacante && state.key !== requestKey,
    generando: vacanteId !== null && generandoIds.has(vacanteId),
    generar,
    retry: recargar,
    recargar,
  }
}
