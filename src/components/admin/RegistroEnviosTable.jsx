import { Check, ChevronDown, Clock, TriangleAlert } from 'lucide-react'
import { Fragment, useState } from 'react'
import {
  formatFechaHoraArgentina,
  getCanalNotificacion,
  getDestinoEnvio,
  getMaquinaEnvio,
  getTipoAvisoEnvio,
} from '../../utils/notificaciones'
import ErrorEnvioBadge from './ErrorEnvioBadge'

/** @import { RegistroNotificacion } from '../../types/notificaciones' */

const SKELETON_COUNT = 5
const COLUMNAS = 8
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const thBase = `px-3 py-3.5 text-xs font-medium tracking-wide whitespace-nowrap uppercase ${textMuted}`
const badgeBase = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap'
const badgeTipo = `${badgeBase} bg-black/5 font-medium text-neutral-700 dark:bg-white/10 dark:text-neutral-300`

/*
 * Etapa del aviso cuando se envió: Próximo en ámbar (el mismo "por vencer" de las tarjetas de avisos) y Vencido en
 * rojo. Van en tinte, no sólidas, para que el Estado (lo que se busca en esta pantalla) sea lo que más resalte.
 * warn-800 sobre warn-100 y brand-700 sobre su tinte pasan AA en claro; warn-300 y brand-300, en oscuro.
 * Nunca solo el color: siempre ícono y texto
 */
const ETAPAS = Object.freeze({
  PROXIMO: {
    label: 'Próximo',
    Icon: Clock,
    className: 'bg-warn-100 text-warn-800 dark:bg-warn-400/15 dark:text-warn-300',
  },
  VENCIDO: {
    label: 'Vencido',
    Icon: TriangleAlert,
    className: 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300',
  },
})

// Enviado: el verde de estado (ok-700 sobre ok-50 en claro, ok-300 sobre su tinte en oscuro), con tilde y texto
const badgeEnviado = `${badgeBase} bg-ok-50 text-ok-700 dark:bg-ok-300/15 dark:text-ok-300`

function Etapa({ etapa }) {
  const config = ETAPAS[etapa]
  if (!config) return <span className={textMuted}>{etapa || '—'}</span>
  const { label, Icon, className } = config
  return (
    <span className={`${badgeBase} ${className}`}>
      <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
      {label}
    </span>
  )
}

function Estado({ envio }) {
  if (envio.estado === 'ERROR') return <ErrorEnvioBadge detalle={envio.error_detalle} />
  if (envio.estado === 'ENVIADO') {
    return (
      <span className={badgeEnviado}>
        <Check size={14} strokeWidth={2.5} aria-hidden="true" />
        Enviado
      </span>
    )
  }
  return <span className={textMuted}>{envio.estado || '—'}</span>
}

function Tipo({ tipo }) {
  const { label, Icon } = getTipoAvisoEnvio(tipo)
  return (
    <span className={badgeTipo}>
      {Icon && <Icon size={14} strokeWidth={1.75} aria-hidden="true" />}
      {label}
    </span>
  )
}

/** Canal: en la tabla, solo el ícono (el nombre queda para lectores y en el tooltip); en la tarjeta, ícono y nombre */
function Canal({ canal, soloIcono = false }) {
  const { label, Icon } = getCanalNotificacion(canal)
  return (
    <span title={label} className={`inline-flex items-center gap-2 font-medium whitespace-nowrap ${textSoft}`}>
      <Icon size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-brand-700 dark:text-brand-400" />
      <span className={soloIcono ? 'sr-only' : ''}>{label}</span>
    </span>
  )
}

function Fecha({ iso, className = '' }) {
  return (
    <time dateTime={iso ?? undefined} className={`tabular-nums whitespace-nowrap ${className}`}>
      {formatFechaHoraArgentina(iso)}
    </time>
  )
}

/** Botón que despliega el mensaje. `compacto` (en la tabla) es solo la flecha; el nombre accesible dice qué abre */
function BotonMensaje({ envio, isOpen, onToggle, panelId, compacto }) {
  const label = isOpen ? 'Ocultar mensaje' : 'Ver mensaje'
  return (
    <button
      type="button"
      onClick={() => onToggle(envio.id)}
      aria-expanded={isOpen}
      aria-controls={panelId}
      aria-label={compacto ? `${label} enviado a ${getDestinoEnvio(envio)}` : undefined}
      title={compacto ? label : undefined}
      className={`interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-control text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white ${compacto ? 'size-11' : 'px-3.5'} ${isOpen ? 'bg-black/5 text-black dark:bg-white/10 dark:text-white' : ''}`}
    >
      {!compacto && label}
      <ChevronDown
        size={18}
        strokeWidth={1.75}
        aria-hidden="true"
        className={`transition-transform duration-200 ease-glass motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  )
}

/**
 * Lo que se ve al desplegar un envío: el mensaje completo tal cual salió, el detalle del error si falló y el destino
 * crudo (chat_id o mail), útil para encontrar una regla mal configurada. Sin vidrio: va dentro de la superficie
 */
function DetalleEnvio({ envio, id }) {
  const { label: canal } = getCanalNotificacion(envio.canal)
  const conEtiqueta = Boolean(envio.regla_etiqueta?.trim())
  return (
    <div id={id} className="flex flex-col gap-4 rounded-control bg-black/[0.035] p-4 dark:bg-white/[0.06]">
      <div className="flex flex-col gap-1">
        <p className={`text-xs font-medium tracking-wide uppercase ${textMuted}`}>Mensaje</p>
        <p className={`text-sm text-pretty break-words whitespace-pre-line ${textStrong}`}>{envio.mensaje || '—'}</p>
      </div>
      {envio.estado === 'ERROR' && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-wide text-brand-700 uppercase dark:text-brand-300">
            Detalle del error
          </p>
          <p className={`text-sm text-pretty break-words ${textStrong}`}>
            {envio.error_detalle?.trim() || 'El canal no informó el motivo.'}
          </p>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className={`text-xs font-medium tracking-wide uppercase ${textMuted}`}>
          {envio.estado === 'ERROR' ? 'Se intentó enviar a' : 'Enviado a'}
        </p>
        <p className={`text-sm break-all ${textSoft}`}>
          {canal} · <span className="tabular-nums">{envio.destino || '—'}</span>
          {!conEtiqueta && <span className={textMuted}> (la regla ya no existe)</span>}
        </p>
      </div>
    </div>
  )
}

/**
 * Registro de envíos: tabla desde xl y tarjetas por debajo, en el orden en que los manda el back (el más nuevo arriba).
 * Columnas: Fecha y hora (de Argentina), Máquina (código y nombre), Tipo, Etapa, Canal (ícono), Destino (la etiqueta
 * de la regla, o el chat_id / mail si no tiene) y Estado. El detalle de un error se ve sobre el badge; el mensaje
 * completo, al desplegar la fila. Es de solo lectura
 * @param {{ envios: RegistroNotificacion[] }} props
 */
export default function RegistroEnviosTable({ envios }) {
  const [abiertos, setAbiertos] = useState(() => new Set())

  const toggle = (id) => {
    setAbiertos((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const panelId = (envio, vista) => `envio-${envio.id}-${vista}`

  return (
    <div className="glass overflow-hidden">
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10">
              <th scope="col" className={`${thBase} pl-6`}>
                Fecha y hora
              </th>
              <th scope="col" className={thBase}>
                Máquina
              </th>
              <th scope="col" className={thBase}>
                Tipo
              </th>
              <th scope="col" className={thBase}>
                Etapa
              </th>
              <th scope="col" className={thBase}>
                Canal
              </th>
              <th scope="col" className={thBase}>
                Destino
              </th>
              <th scope="col" className={thBase}>
                Estado
              </th>
              <th scope="col" className={`${thBase} pr-4`}>
                <span className="sr-only">Mensaje</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {envios.map((envio, index) => {
              const isOpen = abiertos.has(envio.id)
              const { codigo, nombre } = getMaquinaEnvio(envio)
              const borde = index > 0 ? 'border-t border-black/5 dark:border-white/10' : ''
              return (
                <Fragment key={envio.id}>
                  <tr className={`${borde} transition-colors duration-200 ease-glass ${isOpen ? 'bg-black/[0.02] dark:bg-white/[0.03]' : ''}`}>
                    <td className={`py-3 pr-3 pl-6 ${textSoft}`}>
                      <Fecha iso={envio.enviado_en} />
                    </td>
                    <td className="min-w-40 px-3 py-3">
                      <p className={`font-medium tabular-nums ${textStrong}`}>{codigo}</p>
                      {nombre && <p className={`text-pretty ${textMuted}`}>{nombre}</p>}
                    </td>
                    <td className="px-3 py-3">
                      <Tipo tipo={envio.aviso?.tipo} />
                    </td>
                    <td className="px-3 py-3">
                      <Etapa etapa={envio.etapa} />
                    </td>
                    <td className="px-3 py-3">
                      <Canal canal={envio.canal} soloIcono />
                    </td>
                    <td className={`max-w-56 px-3 py-3 font-medium text-pretty break-words ${textStrong}`}>
                      {getDestinoEnvio(envio)}
                    </td>
                    <td className="px-3 py-3">
                      <Estado envio={envio} />
                    </td>
                    <td className="py-1 pr-4 pl-1 text-right">
                      <BotonMensaje
                        envio={envio}
                        isOpen={isOpen}
                        onToggle={toggle}
                        panelId={panelId(envio, 'tabla')}
                        compacto
                      />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-black/[0.02] dark:bg-white/[0.03]">
                      <td colSpan={COLUMNAS} className="px-6 pt-1 pb-4">
                        <DetalleEnvio envio={envio} id={panelId(envio, 'tabla')} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-black/5 xl:hidden dark:divide-white/10">
        {envios.map((envio) => {
          const isOpen = abiertos.has(envio.id)
          const { codigo, nombre } = getMaquinaEnvio(envio)
          return (
            <li key={envio.id} className="flex flex-col gap-3 py-4 pr-3 pl-4 sm:pr-5 sm:pl-5">
              <div className="flex items-start gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className={`font-medium text-pretty ${textStrong}`}>
                    <span className="tabular-nums">{codigo}</span>
                    {nombre && <span className={`font-normal ${textMuted}`}> · {nombre}</span>}
                  </p>
                  <Fecha iso={envio.enviado_en} className={`text-sm ${textMuted}`} />
                </div>
                <div className="shrink-0">
                  <Estado envio={envio} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Tipo tipo={envio.aviso?.tipo} />
                <Etapa etapa={envio.etapa} />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <Canal canal={envio.canal} />
                <span aria-hidden="true" className={textMuted}>
                  →
                </span>
                <span className={`min-w-0 font-medium break-words ${textStrong}`}>{getDestinoEnvio(envio)}</span>
              </div>

              <div className="-ml-3.5">
                <BotonMensaje envio={envio} isOpen={isOpen} onToggle={toggle} panelId={panelId(envio, 'tarjeta')} />
              </div>
              {isOpen && <DetalleEnvio envio={envio} id={panelId(envio, 'tarjeta')} />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Versión de carga: la misma superficie con filas vacías
export function RegistroEnviosTableSkeleton() {
  return (
    <div aria-hidden="true" className="glass">
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex items-center gap-4 py-4 pr-4 pl-4 sm:pl-6">
            <div className="flex flex-1 flex-col gap-2 xl:flex-row xl:items-center xl:gap-6">
              <span className={`h-4 w-28 ${skeletonBar}`} />
              <span className={`h-4 w-2/5 max-w-48 ${skeletonBar}`} />
              <span className={`hidden h-6 w-20 rounded-full xl:block ${skeletonBar}`} />
              <span className={`hidden h-6 w-20 rounded-full xl:block ${skeletonBar}`} />
              <span className={`h-4 w-3/5 max-w-40 ${skeletonBar}`} />
            </div>
            <span className={`h-6 w-20 rounded-full ${skeletonBar}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
