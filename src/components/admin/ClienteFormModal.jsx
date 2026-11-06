import { Construction } from 'lucide-react'
import Modal from './Modal'

/*
 * Alta de un cliente. Provisorio: el formulario llega en su propia issue; por ahora el modal solo avisa que está
 * en construcción
 */
export default function ClienteFormModal({ onClose }) {
  return (
    <Modal title="Nuevo cliente" description="Empresa a la que se le va a alquilar maquinaria." onClose={onClose}>
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="icon-badge">
          <Construction size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <p className="font-medium">En construcción</p>
        <p className="max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
          El formulario de alta de clientes se completa en una próxima etapa.
        </p>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={onClose} className="btn-tonal">
          Cerrar
        </button>
      </div>
    </Modal>
  )
}
