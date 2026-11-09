import { CheckCheck, Clock, Cog, MessageSquareText, TriangleAlert, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import { RUTAS_MAQUINAS } from '../../config/rutasPanel'
import {
  describirAviso,
  formatCreacionAviso,
  getAtencionAviso,
  getUrgenciaAviso,
  ICONOS_TIPO_AVISO,
} from '../../utils/avisos'

/** @import { Aviso } from '../../types/avisos' */

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const badgeBase = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap'
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

/*
 * Urgencia de un pendiente: vencido en rojo sólido (blanco sobre brand-600 pasa AA) y por vencer en ámbar
 * (warn-800 sobre warn-100 en claro, warn-300 sobre su tinte en oscuro). Nunca solo el color: siempre ícono y texto.
 * La franja de la izquierda repite el color para encontrarlos de un vistazo en la lista
 */
const URGENCIA = Object.freeze({
  vencido: { Icon: TriangleAlert, badge: 'bg-brand-600 text-white', franja: 'bg-brand-600 dark:bg-brand-500' },
  'por-vencer': {
    Icon: Clock,
    badge: 'bg-warn-100 text-warn-800 dark:bg-warn-400/15 dark:text-warn-300',
    franja: 'bg-warn-400',
  },
})

const badgeAtendido = 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300'

/**
 * Estado del aviso arriba a la derecha: la urgencia si está pendiente ("Vencido hace 20 hs", "Faltan 30 hs"),
 * "Atendido" si ya se resolvió. Un pendiente sin el dato de lo que falta no muestra nada
 * @param {{ aviso: Aviso }} props
 */
function EstadoAviso({ aviso }) {
  if (aviso.estado === 'ATENDIDO') {
    return (
      <span className={`${badgeBase} ${badgeAtendido}`}>
        <CheckCheck size={14} strokeWidth={2.25} aria-hidden="true" />
        Atendido
      </span>
    )
  }
  const urgencia = getUrgenciaAviso(aviso)
  if (!urgencia) return null
  const { Icon, badge } = URGENCIA[urgencia.tipo]
  return (
    <span className={`${badgeBase} ${badge}`}>
      <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
      {urgencia.label}
    </span>
  )
}

/**
 * Cómo se cerró un aviso atendido: la nota y quién y cuándo, o "Cerrado automáticamente" si no lo cerró un usuario
 * (por ejemplo, al atender el service de un hito mayor de la misma máquina, que deja su propia nota)
 * @param {{ aviso: Aviso }} props
 */
function AtencionAviso({ aviso }) {
  const { automatico, usuario, cuando, nota } = getAtencionAviso(aviso)
  const AutorIcon = automatico ? Cog : UserRound

  return (
    <div className="flex flex-col gap-2 rounded-control bg-black/5 p-3 text-sm dark:bg-white/5">
      <p className={`flex gap-2 ${nota ? textSoft : textMuted}`}>
        <MessageSquareText size={16} strokeWidth={1.75} aria-hidden="true" className={`mt-0.5 shrink-0 ${textMuted}`} />
        <span className="min-w-0 break-words whitespace-pre-line">
          <span className="sr-only">Nota: </span>
          {nota ?? 'Sin nota'}
        </span>
      </p>
      <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${textMuted}`}>
        <span className="inline-flex min-w-0 items-center gap-2">
          <AutorIcon size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          {automatico ? (
            <span className={`font-medium ${textSoft}`}>Cerrado automáticamente</span>
          ) : (
            <span className="min-w-0 truncate">
              <span className="sr-only">Atendido por </span>
              <span className={`font-medium ${textSoft}`}>{usuario ?? 'Usuario sin nombre'}</span>
            </span>
          )}
        </span>
        {cuando && (
          <span className="basis-full pl-6 tabular-nums sm:basis-auto sm:pl-0">
            <span aria-hidden="true" className="hidden sm:inline">
              ·{' '}
            </span>
            <span className="sr-only">el </span>
            {cuando}
          </span>
        )}
      </p>
    </div>
  )
}

/**
 * Tarjeta de un aviso del centro de avisos: la máquina (código interno y nombre, que abre su detalle si el rol tiene
 * Máquinas), qué pide (service con su hito y las horas actuales, o certificación con su vencimiento), la urgencia si
 * está pendiente y, si ya se atendió, la nota con quién y cuándo.
 * "Marcar atendido" va solo en los pendientes y con `puedeAtender` (edición en Avisos); `onMarcarAtendido` es opcional:
 * mientras no esté el modal de atención el botón se ve, pero todavía no hace nada
 * @param {{
 *   aviso: Aviso,
 *   puedeVerMaquina: boolean,
 *   puedeAtender: boolean,
 *   onMarcarAtendido?: (aviso: Aviso) => void,
 * }} props
 */
export default function AvisoCard({ aviso, puedeVerMaquina, puedeAtender, onMarcarAtendido }) {
  const { maquina } = aviso
  const urgencia = getUrgenciaAviso(aviso)
  const { titulo, datos } = describirAviso(aviso)
  const creado = formatCreacionAviso(aviso.creado_en)
  const TipoIcon = ICONOS_TIPO_AVISO[aviso.tipo] ?? Clock
  const pendiente = aviso.estado === 'PENDIENTE'

  const nombreMaquina = (
    <>
      <span className="tabular-nums">{maquina?.codigo_interno ?? '—'}</span>
      {maquina?.nombre && <span className={`font-normal ${textSoft}`}> · {maquina.nombre}</span>}
    </>
  )

  return (
    <li className="glass-flat relative overflow-hidden">
      {urgencia && (
        <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${URGENCIA[urgencia.tipo].franja}`} />
      )}
      <article className="flex flex-col gap-4 p-4 pl-5 sm:p-5 sm:pl-6">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-control bg-black/5 dark:bg-white/10 ${textSoft}`}
            >
              <TipoIcon size={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className={`font-semibold ${textStrong}`}>
                {puedeVerMaquina && maquina?.id != null ? (
                  <Link
                    to={RUTAS_MAQUINAS.detalle(maquina.id)}
                    className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                  >
                    {nombreMaquina}
                  </Link>
                ) : (
                  nombreMaquina
                )}
              </h2>
              <p className={`font-medium ${textSoft}`}>{titulo}</p>
            </div>
          </div>
          <EstadoAviso aviso={aviso} />
        </div>

        {/* Datos y acción en una fila desde sm; en celular, el botón abajo y a lo ancho, al alcance del pulgar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {(datos.length > 0 || creado) && (
            <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {datos.map(({ label, valor }) => (
                <div key={label} className="flex gap-1.5">
                  <dt className={textMuted}>{label}</dt>
                  <dd className={`font-medium tabular-nums ${textStrong}`}>{valor}</dd>
                </div>
              ))}
              {creado && (
                <div className="flex gap-1.5">
                  <dt className={textMuted}>Generado el</dt>
                  <dd className={`tabular-nums ${textSoft}`}>{creado}</dd>
                </div>
              )}
            </dl>
          )}

          {pendiente && puedeAtender && (
            <button
              type="button"
              onClick={onMarcarAtendido ? () => onMarcarAtendido(aviso) : undefined}
              className="btn-tonal w-full shrink-0 sm:ml-auto sm:w-auto"
            >
              <CheckCheck size={18} strokeWidth={1.75} aria-hidden="true" />
              Marcar atendido
            </button>
          )}
        </div>

        {!pendiente && <AtencionAviso aviso={aviso} />}
      </article>
    </li>
  )
}

// Versión de carga: las mismas tarjetas, vacías
export function AvisosSkeleton({ count = 3 }) {
  return (
    <ul aria-hidden="true" className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="glass-flat flex flex-col gap-4 p-4 pl-5 sm:p-5 sm:pl-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 items-start gap-3">
              <span className={`size-11 shrink-0 ${skeletonBar}`} />
              <div className="flex flex-1 flex-col gap-2 pt-0.5">
                <span className={`h-4 w-3/5 max-w-56 ${skeletonBar}`} />
                <span className={`h-4 w-2/5 max-w-36 ${skeletonBar}`} />
              </div>
            </div>
            <span className={`h-6 w-28 rounded-full ${skeletonBar}`} />
          </div>
          <span className={`h-4 w-4/5 max-w-80 ${skeletonBar}`} />
        </li>
      ))}
    </ul>
  )
}
