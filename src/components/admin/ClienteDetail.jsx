import { Ban, PencilLine, RotateCcw, UserRoundX } from 'lucide-react'
import EstadoActivoBadge from './EstadoActivoBadge'
import PermissionBadge from './PermissionBadge'

/** @import { ClienteDetalle } from '../../types/alquileres' */

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
const sectionClass = 'glass flex flex-col gap-5 p-6 sm:p-8'
const gridClass = 'grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'

// Un dato del cliente: etiqueta y valor. Lo vacío se muestra como "—", atenuado. `wide` ocupa toda la fila
function Dato({ label, value, wide = false }) {
  const texto = typeof value === 'string' ? value.trim() : value
  const isMissing = texto == null || texto === ''

  let valueClass = `font-medium break-words ${textStrong}`
  if (isMissing) valueClass = textMuted
  else if (wide) valueClass = `leading-relaxed text-pretty break-words whitespace-pre-line ${textSoft}`

  return (
    <div className={`flex min-w-0 flex-col gap-1 ${wide ? 'sm:col-span-full' : ''}`}>
      <dt className={`text-sm ${textMuted}`}>{label}</dt>
      <dd className={valueClass}>{isMissing ? '—' : texto}</dd>
    </div>
  )
}

function countAlquileres(cantidad) {
  if (cantidad === 0) return 'Sin alquileres'
  return cantidad === 1 ? '1 alquiler' : `${cantidad} alquileres`
}

/**
 * Detalle de un cliente: encabezado con su estado y, con `canEdit`, "Editar" y "Desactivar" / "Reactivar" (llegan como
 * callbacks, igual que en la tabla). No hay acción de eliminar. Un cliente inactivo se sigue mostrando con un aviso:
 * se conserva con su historial y se puede editar o reactivar.
 * El historial de alquileres del cliente llega en su propia issue; por ahora se muestra cuántos tiene
 * @param {{
 *   cliente: ClienteDetalle,
 *   canEdit: boolean,
 *   onEdit: (cliente: ClienteDetalle) => void,
 *   onToggleEstado: (cliente: ClienteDetalle) => void,
 * }} props
 */
export default function ClienteDetail({ cliente, canEdit, onEdit, onToggleEstado }) {
  const cuit = cliente.cuit?.trim()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          {cuit && <p className={`text-sm font-medium tabular-nums ${textMuted}`}>CUIT {cuit}</p>}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold break-words sm:text-3xl">{cliente.razon_social}</h1>
            {!canEdit && <PermissionBadge puedeEditar={false} />}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <EstadoActivoBadge activo={cliente.activo} />
            <span className={`text-sm ${textMuted}`}>{countAlquileres(cliente._count?.alquileres ?? 0)}</span>
          </div>
        </div>
        {canEdit && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button type="button" onClick={() => onToggleEstado(cliente)} className="btn-secondary flex-1 sm:flex-none">
              {cliente.activo ? (
                <Ban size={18} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <RotateCcw size={18} strokeWidth={1.75} aria-hidden="true" />
              )}
              {cliente.activo ? 'Desactivar' : 'Reactivar'}
            </button>
            <button type="button" onClick={() => onEdit(cliente)} className="btn-primary flex-1 sm:flex-none">
              <PencilLine size={18} strokeWidth={1.75} aria-hidden="true" />
              Editar
            </button>
          </div>
        )}
      </header>

      {!cliente.activo && (
        <div className="glass flex items-start gap-4 p-5 sm:p-6">
          <span className="icon-badge">
            <UserRoundX size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-0.5 pt-0.5">
            <p className="font-semibold">Cliente inactivo</p>
            <p className={`text-sm text-pretty ${textMuted}`}>
              No aparece para nuevos alquileres. Sus datos y su historial se conservan.
            </p>
          </div>
        </div>
      )}

      <section aria-labelledby="datos-cliente" className={sectionClass}>
        <h2 id="datos-cliente" className="text-lg font-semibold">
          Datos del cliente
        </h2>
        <dl className={gridClass}>
          <Dato label="Razón social" value={cliente.razon_social} />
          <Dato label="CUIT" value={cliente.cuit} />
          <Dato label="Contacto" value={cliente.contacto_nombre} />
          <Dato label="Teléfono" value={cliente.telefono} />
          <Dato label="Email" value={cliente.email} />
          <Dato label="Dirección" value={cliente.direccion} />
          <Dato label="Localidad" value={cliente.localidad} />
          <Dato label="Observaciones" value={cliente.observaciones} wide />
        </dl>
      </section>
    </div>
  )
}

// Marcador con la forma del detalle mientras carga el cliente
export function ClienteDetailSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className={`h-4 w-32 ${skeletonBar}`} />
        <span className={`h-9 w-64 max-w-full ${skeletonBar}`} />
        <span className={`h-5 w-48 ${skeletonBar}`} />
      </div>
      <div className={sectionClass}>
        <span className={`h-6 w-40 ${skeletonBar}`} />
        <div className={gridClass}>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <span className={`h-4 w-24 ${skeletonBar}`} />
              <span className={`h-5 w-3/5 ${skeletonBar}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
