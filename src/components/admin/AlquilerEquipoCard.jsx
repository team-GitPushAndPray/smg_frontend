import { Check, Undo2, Truck } from 'lucide-react'
import { Link } from 'react-router'
import { RUTAS_ALQUILERES } from '../../config/rutasPanel'
import {
  admiteChecklists,
  formatFechaHoraAlquiler,
  getAccionesEquipo,
  nombreCompleto,
  TIPOS_CHECKLIST_ALQUILER,
  TIPOS_EQUIPO_ALQUILER,
} from '../../utils/alquileres'
import { formatHorasChecklist } from '../../utils/historial'

/** @import { AlquilerEquipo, ChecklistAlquilerResumen, EstadoAlquiler, TipoChecklistAlquiler } from '../../types/alquileres' */

const textStrong = 'text-black dark:text-white'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const chipBase = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap'

const ETAPAS = {
  ENTREGA: { Icon: Truck, boton: 'Completar entrega' },
  DEVOLUCION: { Icon: Undo2, boton: 'Completar devolución' },
}

/*
 * Qué dice una etapa que todavía no se hizo y no tiene botón. Mientras el alquiler está en curso, que todavía falta
 * (la devolución, además, que espera la entrega); si ya terminó o se anuló, que no se hizo
 */
function textoPendiente(tipo, { enCurso, entregado }) {
  if (!enCurso) return tipo === 'ENTREGA' ? 'No se entregó.' : 'No se devolvió.'
  if (tipo === 'ENTREGA') return 'Todavía no se entregó.'
  return entregado ? 'Todavía no volvió.' : 'Se completa después de la entrega.'
}

function DatoEtapa({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className={`text-xs ${textMuted}`}>{label}</dt>
      <dd className={`text-sm font-medium break-words tabular-nums ${textStrong}`}>{value || '—'}</dd>
    </div>
  )
}

/**
 * Una columna de la tarjeta: la entrega o la devolución del equipo. Hecha: cuándo, quién y, si es máquina, las horas de
 * motor. Sin hacer: el botón que lleva al checklist (si corresponde) o por qué falta
 * @param {{
 *   tipo: TipoChecklistAlquiler,
 *   checklist: ChecklistAlquilerResumen | null,
 *   esMaquina: boolean,
 *   href: string | null,
 *   pendiente: string,
 *   equipoLabel: string,
 * }} props
 */
function Etapa({ tipo, checklist, esMaquina, href, pendiente, equipoLabel }) {
  const { Icon, boton } = ETAPAS[tipo]
  const titulo = TIPOS_CHECKLIST_ALQUILER[tipo]
  const hecha = Boolean(checklist)

  return (
    <div className="flex flex-col gap-3 rounded-control border border-black/5 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="inline-flex items-center gap-2 font-semibold">
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" className={textMuted} />
          {titulo}
        </h4>
        {hecha ? (
          <span className={`${chipBase} bg-black text-white dark:bg-white dark:text-black`}>
            <Check size={14} strokeWidth={2} aria-hidden="true" />
            Hecha
          </span>
        ) : (
          <span className={`${chipBase} ring-1 ring-neutral-400 ring-inset ${textMuted} dark:ring-neutral-500`}>
            Sin hacer
          </span>
        )}
      </div>

      {hecha && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <DatoEtapa label="Fecha" value={formatFechaHoraAlquiler(checklist.fecha)} />
          <DatoEtapa label="Responsable" value={nombreCompleto(checklist.responsable_nombre, checklist.responsable_apellido)} />
          {esMaquina && <DatoEtapa label="Horas de motor" value={formatHorasChecklist(checklist.horas_motor, true)} />}
        </dl>
      )}

      {!hecha && href && (
        <Link
          to={href}
          aria-label={`${boton} de ${equipoLabel}`}
          className="btn-tonal w-full sm:w-auto sm:self-start"
        >
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
          {boton}
        </Link>
      )}

      {!hecha && !href && <p className={`text-sm text-pretty ${textMuted}`}>{pendiente}</p>}
    </div>
  )
}

/**
 * Tarjeta de un equipo del alquiler: código interno, categoría y marca, tipo (máquina o aditamento) y dos columnas,
 * Entrega y Devolución, que se apilan en pantallas chicas. Los botones "Completar entrega" / "Completar devolución"
 * llevan al checklist del equipo y solo aparecen con edición en Alquileres y el alquiler en curso (getAccionesEquipo)
 * @param {{ alquilerId: number, estado: EstadoAlquiler, equipo: AlquilerEquipo, puedeEditar: boolean }} props
 */
export default function AlquilerEquipoCard({ alquilerId, estado, equipo, puedeEditar }) {
  const esMaquina = equipo.tipo === 'MAQUINA'
  const acciones = getAccionesEquipo(equipo, { estado, puedeEditar })
  const contexto = { enCurso: admiteChecklists(estado), entregado: Boolean(equipo.entrega) }
  const descripcion = [equipo.categoria, equipo.marca]
    .map((valor) => valor?.trim())
    .filter(Boolean)
    .join(' · ')
  const tituloId = `equipo-${equipo.id}`

  const etapa = (tipo, checklist, habilitada) => (
    <Etapa
      tipo={tipo}
      checklist={checklist}
      esMaquina={esMaquina}
      href={habilitada ? RUTAS_ALQUILERES.checklist(alquilerId, equipo.id, tipo) : null}
      pendiente={textoPendiente(tipo, contexto)}
      equipoLabel={equipo.codigo_interno}
    />
  )

  return (
    <li aria-labelledby={tituloId} className="glass flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 id={tituloId} className="text-lg font-semibold tabular-nums">
            {equipo.codigo_interno}
          </h3>
          <p className={`text-sm break-words ${textMuted}`}>{descripcion || 'Sin categoría'}</p>
        </div>
        <span className={`${chipBase} bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300`}>
          {TIPOS_EQUIPO_ALQUILER[equipo.tipo] ?? equipo.tipo}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {etapa('ENTREGA', equipo.entrega, acciones.entrega)}
        {etapa('DEVOLUCION', equipo.devolucion, acciones.devolucion)}
      </div>
    </li>
  )
}
