import { useCallback, useMemo, useRef, useState } from 'react'
import ToastList from '../components/ToastList'
import { ToastContext } from './ToastContext'

/*
 * Avisos no bloqueantes (toasts) para toda la app.
 * Uso: const { showToast } = useToast(); showToast('Mensaje', { tipo: 'info' })
 * `tipo` es 'error' (por defecto), 'info' o 'exito'. Si el mismo aviso ya está en pantalla, no se repite.
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const closeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((mensaje, { tipo = 'error' } = {}) => {
    nextId.current += 1
    const toast = { id: nextId.current, mensaje, tipo }
    setToasts((current) =>
      current.some((item) => item.mensaje === mensaje && item.tipo === tipo) ? current : [...current, toast],
    )
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastList toasts={toasts} onClose={closeToast} />
    </ToastContext.Provider>
  )
}
