import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/*
 * Modal del panel: se muestra mientras está montado. Se cierra con Escape o con la X (no con un clic afuera,
 * para no perder un formulario a medio completar); con `isBusy` no se puede cerrar.
 * El foco queda atrapado adentro y, al cerrarse, vuelve al elemento que lo abrió.
 * Va en un portal a <body> para que ningún ancestro con blur o transform lo recorte. z-50: sobre la topbar (z-40)
 * y debajo de los avisos (z-60)
 */
export default function Modal({ title, description, onClose, isBusy = false, children }) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef(null)
  // Se toma al montar, antes de que el autoFocus de un campo mueva el foco adentro del modal
  const openerRef = useRef(document.activeElement)

  // Foco inicial (si ningún campo usa autoFocus), scroll de la página bloqueado y foco de vuelta al cerrar
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.contains(document.activeElement)) dialog.querySelector(FOCUSABLE)?.focus()

    const opener = openerRef.current
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      opener?.focus?.()
    }
  }, [])

  // Escape cierra; Tab y Shift+Tab recorren solo los elementos del modal
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (!isBusy) onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = [...dialogRef.current.querySelectorAll(FOCUSABLE)]
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables.at(-1)
      const isInside = dialogRef.current.contains(document.activeElement)

      if (event.shiftKey && (document.activeElement === first || !isInside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !isInside)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isBusy, onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div aria-hidden="true" className="fixed inset-0 animate-fade-in bg-(--overlay-bg) backdrop-blur-sm" />
      <div className="relative flex min-h-full items-center justify-center p-3 sm:p-6">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className="glass-strong flex w-full max-w-lg animate-dialog-in flex-col gap-6 p-5 sm:p-7"
        >
          <header className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 pt-1.5">
              <h2 id={titleId} className="text-xl font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-sm text-neutral-600 dark:text-neutral-400">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              aria-label="Cerrar"
              title="Cerrar"
              className="interactive -mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-control text-neutral-600 hover:bg-black/5 hover:text-black dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </header>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
