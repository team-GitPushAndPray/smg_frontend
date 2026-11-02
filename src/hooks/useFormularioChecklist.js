import { useEffect, useState } from 'react'
import { getFormularioChecklist } from '../services/checklistsService'

/*
 * Carga el formulario de checklist de un equipo por el token de su QR.
 * `status` es 'loading', 'success', 'not-found' (404: el QR no es de un equipo activo), 'offline' (no se pudo
 * conectar) o 'error' (el back respondió con otro error); `retry` vuelve a pedirlo. Sin conexión, también
 * se reintenta solo cuando el celular recupera la red.
 * El resultado se guarda junto al token que lo pidió: al cambiar de token se ve 'loading' sin mostrar el anterior
 */
export function useFormularioChecklist(token) {
  const [result, setResult] = useState({ token: null, status: 'loading', formulario: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getFormularioChecklist(token, { signal: controller.signal })
      .then((formulario) => {
        if (!controller.signal.aborted) setResult({ token, status: 'success', formulario })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        let status = 'error'
        if (error.status === 404) status = 'not-found'
        else if (error.status === 0) status = 'offline'
        setResult({ token, status, formulario: null })
      })

    return () => controller.abort()
  }, [token, attempt])

  const retry = () => {
    setResult({ token: null, status: 'loading', formulario: null })
    setAttempt((value) => value + 1)
  }

  const isOffline = result.token === token && result.status === 'offline'

  useEffect(() => {
    if (!isOffline) return
    const onOnline = () => {
      setResult({ token: null, status: 'loading', formulario: null })
      setAttempt((value) => value + 1)
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [isOffline])

  if (result.token !== token) return { status: 'loading', formulario: null, retry }
  return { status: result.status, formulario: result.formulario, retry }
}
