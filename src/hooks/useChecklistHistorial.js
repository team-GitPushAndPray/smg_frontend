import { useEffect, useState } from 'react'
import { obtenerChecklistEquipo } from '../services/historialService'

const esId = (valor) => /^\d+$/.test(valor ?? '')

/*
 * Detalle de un checklist del historial de un equipo, por los ids de la URL.
 * `status` es 'loading', 'success', 'not-found' (404: no existe o es de otro equipo) o 'error'; `retry` lo vuelve
 * a pedir. El resultado se guarda junto a los ids que lo pidieron: al cambiar de checklist se ve 'loading' sin
 * mostrar el anterior
 */
export function useChecklistHistorial(equipoId, checklistId) {
  const isValid = esId(equipoId) && esId(checklistId)
  const key = `${equipoId}:${checklistId}`
  const [result, setResult] = useState({ key: null, status: 'loading', checklist: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isValid) return
    const controller = new AbortController()

    obtenerChecklistEquipo(equipoId, checklistId, { signal: controller.signal })
      .then((checklist) => {
        if (!controller.signal.aborted) setResult({ key, status: 'success', checklist })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setResult({ key, status: error.status === 404 ? 'not-found' : 'error', checklist: null })
      })

    return () => controller.abort()
  }, [key, equipoId, checklistId, isValid, attempt])

  const retry = () => {
    setResult({ key: null, status: 'loading', checklist: null })
    setAttempt((value) => value + 1)
  }

  // Un id que no es un número no se le pide al back: no puede existir
  if (!isValid) return { status: 'not-found', checklist: null, retry }
  if (result.key !== key) return { status: 'loading', checklist: null, retry }
  return { status: result.status, checklist: result.checklist, retry }
}
