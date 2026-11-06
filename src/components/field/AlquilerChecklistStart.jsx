import { ChevronLeft, ChevronRight, Truck, Undo2 } from 'lucide-react'
import { Link } from 'react-router'
import { useChecklist } from '../../hooks/useChecklist'
import { formatFechaAlquiler, TIPOS_EQUIPO_ALQUILER } from '../../utils/alquileres'
import EquipoSummary from './EquipoSummary'
import FieldScreen from './FieldScreen'
import MainAction from './MainAction'

// Los mismos íconos que la tarjeta del equipo en el detalle del alquiler
const ICONOS = { ENTREGA: Truck, DEVOLUCION: Undo2 }

// Un dato del alquiler: etiqueta arriba, valor abajo, para que los textos largos (cliente, ubicación) no se corten
function Dato({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5 py-3">
      <dt className="text-neutral-700">{label}</dt>
      <dd className="text-lg font-semibold break-words">{children || '—'}</dd>
    </div>
  )
}

/**
 * "Volver al alquiler": va en el lugar del "Atrás" del primer paso (WizardHeader). Es la única salida del asistente
 * @param {{ to: string }} props
 */
export function SalidaAlquiler({ to }) {
  return (
    <Link
      to={to}
      className="interactive -ml-2 inline-flex min-h-12 min-w-12 items-center gap-1 rounded-control px-2 font-medium text-neutral-700 hover:text-black"
    >
      <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
      Volver al alquiler
    </Link>
  )
}

/**
 * Primer paso del checklist de un equipo alquilado: qué se hace (entrega o devolución), el equipo y los datos del
 * alquiler, todo de solo lectura (vienen del alquiler y no se cambian acá). El tipo ya viene elegido desde el detalle:
 * el botón arranca la carga. `alquiler` es el contexto que trae el formulario (adaptarFormularioChecklistAlquiler)
 * @param {{ header: import('react').ReactNode, alquiler: { id: number | null, cliente: string, ubicacion: string, fechaInicio: string | null, fechaFin: string | null } }} props
 */
export default function AlquilerChecklistStart({ header, alquiler }) {
  const { equipo, opciones, elegirTipo } = useChecklist()
  const { tipo, titulo } = opciones[0]
  const Icon = ICONOS[tipo]
  const tipoEquipo = TIPOS_EQUIPO_ALQUILER[equipo.esMaquina ? 'MAQUINA' : 'ADITAMENTO']

  return (
    <FieldScreen
      header={header}
      footer={
        <MainAction label={`Empezar la ${titulo.toLowerCase()}`} icon={ChevronRight} onClick={() => elegirTipo(tipo)} />
      }
    >
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-control bg-brand-50 text-brand-700">
          <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col">
          <h1 className="text-2xl font-semibold text-balance">{titulo}</h1>
          <p className="text-neutral-700">
            {tipoEquipo}
            {alquiler.id != null && ` · Alquiler N.º ${alquiler.id}`}
          </p>
        </div>
      </div>

      <EquipoSummary equipo={equipo} />

      <section aria-label="Datos del alquiler" className="campo-card px-4">
        <dl className="flex flex-col divide-y divide-neutral-200">
          <Dato label="Cliente">{alquiler.cliente}</Dato>
          <Dato label="Ubicación">{alquiler.ubicacion}</Dato>
          <Dato label="Fechas">
            <span className="tabular-nums">
              {formatFechaAlquiler(alquiler.fechaInicio)} al {formatFechaAlquiler(alquiler.fechaFin)}
            </span>
          </Dato>
        </dl>
      </section>
    </FieldScreen>
  )
}
