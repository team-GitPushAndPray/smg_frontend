import { useCallback, useEffect, useRef, useState } from 'react'
import { analizarPostulacion, listarPostulaciones } from '../services/postulacionesService'
import {
  getErrorAnalisisPendientes,
  getResumenAnalisis,
  necesitaAnalisis,
} from '../utils/postulaciones'
import { useToast } from './useToast'

/*
 * Pausa entre un análisis y el siguiente. El plan gratuito de la IA admite 5 consultas por minuto (una cada 12 s):
 * 13 s deja margen. Se cuenta desde que llega la respuesta del anterior
 */
export const PAUSA_ANALISIS_MS = 13000

const INACTIVO = Object.freeze({ fase: 'inactivo', actual: 0, total: 0 })

// Espera `ms` o hasta que se aborte la señal (Cancelar no tiene que esperar la pausa entera)
function esperar(ms, signal) {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve()
    const timer = window.setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        resolve()
      },
      { once: true },
    )
  })
}

/*
 * "Analizar pendientes" de una vacante: pide todas sus postulaciones (sin el filtro de estado ni el orden de la
 * bandeja), se queda con las que hay que analizar (sin analizar, con error o desactualizadas) y llama a
 * POST /postulaciones/:id/analizar de a una, esperando cada respuesta y con PAUSA_ANALISIS_MS entre pedidos.
 * Una que vuelve con ERROR (o un pedido que falla) cuenta como error y se sigue con la siguiente; un 401 o un 403 cortan
 * el lote (la sesión se cerró o el rol ya no puede editar: apiFetch ya lo avisó).
 * `cancelar` no corta el análisis en curso (el back lo termina igual): deja que termine y no sigue; la pausa sí se
 * corta al momento. Al terminar (o cancelar) avisa "15 analizadas · 2 con error" y llama a `onTerminar` para recargar
 * la bandeja. Si la pantalla se desmonta, el lote se corta igual que con Cancelar, sin avisos.
 * `progreso.fase`: 'inactivo' | 'buscando' (armando la lista) | 'analizando' | 'cancelando' (esperando la actual)
 * @param {{ onTerminar: () => void }} opciones
 */
export function useAnalisisPendientes({ onTerminar }) {
  const { showToast } = useToast()
  const [progreso, setProgreso] = useState(INACTIVO)
  // Lote en curso: su controlador corta la pausa y marca la cancelación. Una ref, porque el bucle no se re-renderiza
  const loteRef = useRef(/** @type {AbortController | null} */ (null))
  const montadoRef = useRef(true)
  const onTerminarRef = useRef(onTerminar)

  useEffect(() => {
    onTerminarRef.current = onTerminar
  }, [onTerminar])

  useEffect(() => {
    montadoRef.current = true
    return () => {
      montadoRef.current = false
      loteRef.current?.abort()
    }
  }, [])

  const iniciar = useCallback(
    async (vacanteId) => {
      if (loteRef.current || vacanteId === null) return
      const lote = new AbortController()
      loteRef.current = lote
      const { signal } = lote
      setProgreso({ fase: 'buscando', actual: 0, total: 0 })

      const terminar = () => {
        loteRef.current = null
        if (montadoRef.current) setProgreso(INACTIVO)
      }

      let pendientes
      try {
        const postulaciones = await listarPostulaciones({ vacanteId })
        pendientes = postulaciones.filter(necesitaAnalisis)
      } catch (error) {
        terminar()
        const mensaje = getErrorAnalisisPendientes(error)
        if (mensaje && montadoRef.current) showToast(mensaje)
        return
      }

      if (signal.aborted) return terminar()
      if (pendientes.length === 0) {
        terminar()
        showToast('Todas las postulaciones de esta vacante ya están analizadas.', { tipo: 'info' })
        return
      }

      const total = pendientes.length
      let procesadas = 0
      let conError = 0
      let cortado = false

      for (const [indice, postulacion] of pendientes.entries()) {
        if (signal.aborted) break
        if (montadoRef.current) setProgreso({ fase: 'analizando', actual: indice + 1, total })

        try {
          const analisis = await analizarPostulacion(postulacion.id)
          if (analisis?.estado !== 'COMPLETADO') conError += 1
        } catch (error) {
          if (error.status === 401 || error.status === 403) {
            cortado = true
            break
          }
          conError += 1
        }
        procesadas += 1

        if (indice < total - 1) await esperar(PAUSA_ANALISIS_MS, signal)
      }

      terminar()
      if (!montadoRef.current) return
      if (procesadas > 0) {
        const cancelado = signal.aborted || cortado
        showToast(getResumenAnalisis({ procesadas, conError, cancelado }), {
          tipo: conError > 0 || cancelado ? 'info' : 'exito',
        })
      }
      onTerminarRef.current?.()
    },
    [showToast],
  )

  const cancelar = useCallback(() => {
    const lote = loteRef.current
    if (!lote || lote.signal.aborted) return
    lote.abort()
    setProgreso((actual) => (actual.fase === 'analizando' ? { ...actual, fase: 'cancelando' } : actual))
  }, [])

  return { progreso, enCurso: progreso.fase !== 'inactivo', iniciar, cancelar }
}
