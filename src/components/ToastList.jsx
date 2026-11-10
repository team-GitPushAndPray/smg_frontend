import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useEffect } from 'react'

// Tiempo en pantalla de cada aviso antes de cerrarse solo
const DURATION_MS = 5000

const icons = {
  error: { Icon: CircleAlert, className: 'text-brand-700 dark:text-brand-400' },
  info: { Icon: Info, className: 'text-neutral-700 dark:text-neutral-300' },
  // Sin verde en la paleta: el éxito se distingue por el ícono, en el color del texto
  exito: { Icon: CircleCheck, className: 'text-black dark:text-white' },
}

function Toast({ toast, onClose }) {
  const { Icon, className } = icons[toast.tipo] ?? icons.error

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast.id, onClose])

  return (
    <li className="glass-strong pointer-events-auto flex animate-toast-in items-start gap-3 py-2 pr-2 pl-4">
      <Icon size={18} strokeWidth={1.75} aria-hidden="true" className={`mt-3 shrink-0 ${className}`} />
      <p className="flex-1 py-2.5 text-sm font-medium">{toast.mensaje}</p>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label="Cerrar aviso"
        title="Cerrar aviso"
        className="interactive grid size-11 shrink-0 place-items-center rounded-control text-neutral-600 hover:bg-black/5 hover:text-black dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <X size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </li>
  )
}

// Pila de avisos: abajo y al centro en celular, abajo a la derecha desde tablet. No tapa clics fuera de los avisos.
// z-60: queda sobre los modales (z-50), así un error se ve aunque haya un formulario abierto
export default function ToastList({ toasts, onClose }) {
  return (
    <ul
      aria-live="polite"
      aria-label="Avisos"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-60 flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-96"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </ul>
  )
}
