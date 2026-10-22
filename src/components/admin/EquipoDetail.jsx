import { Archive, PencilLine } from 'lucide-react'
import { Link } from 'react-router'
import { RUTAS_MAQUINAS } from '../../config/rutasPanel'
import {
  formatHorasActualizadas,
  formatHorasMotor,
  getNombreEquipo,
  SIN_REGISTRAR,
  TIPOS_EQUIPO,
} from '../../utils/equipos'
import EstadoEquipoBadge from './EstadoEquipoBadge'
import PermissionBadge from './PermissionBadge'

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
const sectionClass = 'glass flex flex-col gap-5 p-6 sm:p-8'
const gridClass = 'grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'

/*
 * Un dato de una sección: etiqueta y valor. Lo que no vino se muestra como "—" y, igual que "Sin registrar",
 * atenuado. `wide` ocupa toda la fila (la descripción)
 */
function Dato({ label, value, wide = false }) {
  const isMissing = value == null || value === ''
  const isEmpty = isMissing || value === SIN_REGISTRAR

  let valueClass = `font-medium break-words ${textStrong}`
  if (isEmpty) valueClass = textMuted
  else if (wide) valueClass = `leading-relaxed text-pretty break-words ${textSoft}`

  return (
    <div className={`flex min-w-0 flex-col gap-1 ${wide ? 'sm:col-span-full' : ''}`}>
      <dt className={`text-sm ${textMuted}`}>{label}</dt>
      <dd className={valueClass}>{isMissing ? '—' : value}</dd>
    </div>
  )
}

function Seccion({ id, title, children }) {
  return (
    <section aria-labelledby={id} className={sectionClass}>
      <h2 id={id} className="text-lg font-semibold">
        {title}
      </h2>
      <dl className={gridClass}>{children}</dl>
    </section>
  )
}

/*
 * Detalle de un equipo del panel: encabezado, datos generales y, si es una máquina, sus datos de máquina.
 * Un equipo dado de baja (`activo: false`) se sigue mostrando, porque se conserva por su historial, pero con un aviso
 * y sin "Editar". Sin edición en el módulo (por ejemplo, taller) se ve todo, de solo lectura
 */
export default function EquipoDetail({ equipo, canEdit }) {
  const dadoDeBaja = equipo.activo === false
  const esMaquina = equipo.tipo === 'maquina'
  const marcaModelo = [equipo.marca, equipo.modelo].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <p className={`text-sm font-medium tabular-nums ${textMuted}`}>
            {equipo.codigoInterno}
            {TIPOS_EQUIPO[equipo.tipo] && ` · ${TIPOS_EQUIPO[equipo.tipo]}`}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold break-words sm:text-3xl">{getNombreEquipo(equipo)}</h1>
            {!canEdit && <PermissionBadge puedeEditar={false} />}
          </div>
          {marcaModelo && <p className={textMuted}>{marcaModelo}</p>}
        </div>
        {canEdit && !dadoDeBaja && (
          <Link to={RUTAS_MAQUINAS.editar(equipo.id)} className="btn-primary shrink-0">
            <PencilLine size={18} strokeWidth={1.75} aria-hidden="true" />
            Editar
          </Link>
        )}
      </header>

      {dadoDeBaja && (
        <div className="glass flex items-start gap-4 p-5 sm:p-6">
          <span className="icon-badge">
            <Archive size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-0.5 pt-0.5">
            <p className="font-semibold">Equipo dado de baja</p>
            <p className={`text-sm text-pretty ${textMuted}`}>
              Se conserva por su historial: se puede consultar, pero no editar.
            </p>
          </div>
        </div>
      )}

      <Seccion id="datos-generales" title="Datos generales">
        <Dato label="Código interno" value={equipo.codigoInterno} />
        <Dato label="Nombre" value={getNombreEquipo(equipo)} />
        <Dato label="Tipo" value={TIPOS_EQUIPO[equipo.tipo] ?? equipo.tipo} />
        <Dato label="Categoría" value={equipo.categoria?.nombre} />
        <Dato label="Marca" value={equipo.marca} />
        <div className="flex flex-col items-start gap-1">
          <dt className={`text-sm ${textMuted}`}>Estado</dt>
          <dd>
            <EstadoEquipoBadge estado={equipo.estado} />
          </dd>
        </div>
        <Dato label="Ubicación" value={equipo.ubicacion} />
        <Dato label="Descripción" value={equipo.descripcion?.trim()} wide />
      </Seccion>

      {esMaquina && (
        <Seccion id="datos-maquina" title="Datos de máquina">
          <Dato label="Modelo" value={equipo.modelo} />
          <Dato label="Año" value={equipo.anio} />
          <Dato label="N.º de serie" value={equipo.nSerie} />
          <Dato label="Horas de motor" value={formatHorasMotor(equipo)} />
          <Dato label="Última actualización de horas" value={formatHorasActualizadas(equipo)} />
        </Seccion>
      )}
    </div>
  )
}

function SkeletonSeccion({ count }) {
  return (
    <div className={sectionClass}>
      <span className={`h-6 w-40 ${skeletonBar}`} />
      <div className={gridClass}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <span className={`h-4 w-24 ${skeletonBar}`} />
            <span className={`h-5 w-3/5 ${skeletonBar}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Marcador con la forma del detalle mientras carga el equipo
export function EquipoDetailSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className={`h-4 w-32 ${skeletonBar}`} />
        <span className={`h-9 w-64 max-w-full ${skeletonBar}`} />
        <span className={`h-5 w-48 ${skeletonBar}`} />
      </div>
      <SkeletonSeccion count={8} />
      <SkeletonSeccion count={5} />
    </div>
  )
}
