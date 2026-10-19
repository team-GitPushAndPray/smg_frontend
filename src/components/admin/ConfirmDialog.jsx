import { CircleAlert, LoaderCircle } from 'lucide-react'
import Modal from './Modal'

/*
 * Confirmación de una acción delicada (por ejemplo, dar de baja un usuario).
 * Mientras `isSubmitting` es true no se puede cerrar; `error` se muestra arriba de los botones.
 */
export default function ConfirmDialog({
  title,
  children,
  confirmLabel,
  submittingLabel,
  isSubmitting,
  error,
  onConfirm,
  onClose,
}) {
  return (
    <Modal title={title} onClose={onClose} isBusy={isSubmitting}>
      <div className="flex flex-col gap-4 text-neutral-700 dark:text-neutral-300">{children}</div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-control bg-brand-600/10 px-3.5 py-3 text-sm text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
        >
          <CircleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          autoFocus
          className="interactive inline-flex min-h-11 items-center justify-center rounded-control px-5 font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} disabled={isSubmitting} className="btn-primary">
          {isSubmitting && <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />}
          {isSubmitting ? submittingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
