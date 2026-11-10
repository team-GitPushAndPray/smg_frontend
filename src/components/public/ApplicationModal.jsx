import { CalendarX2, CircleCheck } from 'lucide-react'
import { useState } from 'react'
import Modal from '../admin/Modal'
import ApplicationForm from './ApplicationForm'

const textMuted = 'text-neutral-600 dark:text-neutral-400'

// Resultado del envío (confirmación o búsqueda cerrada), anunciado al lector de pantalla y con el foco en "Listo"
function Resultado({ icon: Icon, children, onClose }) {
  return (
    <div role="status" className="flex flex-col items-center gap-5 py-2 text-center">
      <span className="icon-badge">
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className={`flex flex-col gap-2 text-pretty ${textMuted}`}>{children}</div>
      {/* El botón que mandó el formulario ya no existe: el foco pasa acá */}
      <button type="button" onClick={onClose} autoFocus className="btn-primary w-full sm:w-auto sm:min-w-40">
        Listo
      </button>
    </div>
  )
}

/*
 * Postulación a una vacante en un modal: la vacante ya viene elegida desde su tarjeta. Al enviar bien muestra la
 * confirmación (el formulario se desmonta, así que queda limpio para la próxima). Si la vacante se cerró mientras se
 * completaba, lo avisa y la página recarga el listado (onVacanteCerrada). Mientras se envía no se puede cerrar
 */
export default function ApplicationModal({ vacante, onClose, onVacanteCerrada }) {
  const [estado, setEstado] = useState({ paso: 'formulario' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cerrarVacante = () => {
    setEstado({ paso: 'cerrada' })
    onVacanteCerrada()
  }

  if (estado.paso === 'enviada') {
    return (
      <Modal title="¡Recibimos tu postulación!" onClose={onClose}>
        <Resultado icon={CircleCheck} onClose={onClose}>
          <p>
            Gracias, {estado.nombre}. Tu CV para <span className="font-medium text-black dark:text-white">{vacante.titulo}</span>{' '}
            ya está en manos del equipo.
          </p>
          <p>Si tu perfil encaja con la búsqueda, te vamos a contactar a {estado.email}.</p>
        </Resultado>
      </Modal>
    )
  }

  if (estado.paso === 'cerrada') {
    return (
      <Modal title="Esta búsqueda ya no está abierta" onClose={onClose}>
        <Resultado icon={CalendarX2} onClose={onClose}>
          <p>
            <span className="font-medium text-black dark:text-white">{vacante.titulo}</span> se cerró mientras completabas
            el formulario, así que no enviamos tu postulación.
          </p>
          <p>Fijate si hay otra búsqueda que te interese en el listado.</p>
        </Resultado>
      </Modal>
    )
  }

  return (
    <Modal
      title={vacante.titulo}
      description="Completá tus datos y adjuntá tu CV para postularte."
      onClose={onClose}
      isBusy={isSubmitting}
    >
      <ApplicationForm
        vacante={vacante}
        onSubmittingChange={setIsSubmitting}
        onEnviada={(datos) => setEstado({ paso: 'enviada', nombre: datos.nombre, email: datos.email })}
        onVacanteCerrada={cerrarVacante}
      />
    </Modal>
  )
}
