import { LoaderCircle, PencilLine, Send } from 'lucide-react'
import { getCanalNotificacion, getTipoAvisoRegla } from '../../utils/notificaciones'
import Switch from './Switch'

/** @import { ReglaNotificacion } from '../../types/notificaciones' */

const SKELETON_COUNT = 3
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

// Las inactivas se atenúan con un gris que igual pasa AA sobre el vidrio (no con opacidad, que bajaría el contraste)
const textStrong = {
  activa: 'text-black dark:text-white',
  inactiva: 'text-neutral-600 dark:text-neutral-400',
}
const textSoft = {
  activa: 'text-neutral-700 dark:text-neutral-300',
  inactiva: 'text-neutral-600 dark:text-neutral-400',
}
// El ícono del canal lleva el acento solo si la regla está activa
const iconCanal = {
  activa: 'text-brand-700 dark:text-brand-400',
  inactiva: 'text-neutral-500 dark:text-neutral-400',
}
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const thBase = `px-3 py-3.5 text-xs font-medium tracking-wide whitespace-nowrap uppercase ${textMuted}`
const badgeTipo =
  'inline-flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-neutral-700 dark:bg-white/10 dark:text-neutral-300'
const accionBase =
  'interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-control text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'

function estadoKey(regla) {
  return regla.activo ? 'activa' : 'inactiva'
}

function Canal({ regla }) {
  const { label, Icon } = getCanalNotificacion(regla.canal)
  const estado = estadoKey(regla)
  return (
    <span className={`inline-flex items-center gap-2 font-medium whitespace-nowrap ${textSoft[estado]}`}>
      <Icon size={18} strokeWidth={1.75} aria-hidden="true" className={`shrink-0 ${iconCanal[estado]}`} />
      {label}
    </span>
  )
}

function Recibe({ tipo }) {
  const { label, Icon } = getTipoAvisoRegla(tipo)
  return (
    <span className={badgeTipo}>
      {Icon && <Icon size={14} strokeWidth={1.75} aria-hidden="true" />}
      {label}
    </span>
  )
}

/**
 * Acciones de una regla: Editar y Enviar prueba. `compacto` (en la tabla) deja solo los íconos hasta xl, donde entra
 * el texto; el nombre accesible y el tooltip dicen siempre qué hace cada uno y sobre qué regla
 */
function Acciones({ regla, isProbando, onEdit, onProbar, compacto }) {
  const texto = compacto ? 'sr-only xl:not-sr-only' : ''
  const padding = compacto ? 'px-3 xl:px-3.5' : 'px-3.5'
  const pruebaLabel = isProbando ? 'Enviando…' : 'Enviar prueba'
  return (
    <div className={`flex items-center gap-1 ${compacto ? 'justify-end' : 'flex-wrap'}`}>
      <button
        type="button"
        onClick={() => onEdit(regla)}
        aria-label={`Editar la regla ${regla.etiqueta}`}
        title="Editar"
        className={`${accionBase} ${padding}`}
      >
        <PencilLine size={18} strokeWidth={1.75} aria-hidden="true" />
        <span className={texto}>Editar</span>
      </button>
      <button
        type="button"
        onClick={() => onProbar(regla)}
        disabled={isProbando}
        aria-label={isProbando ? `Enviando prueba a ${regla.etiqueta}` : `Enviar un mensaje de prueba a ${regla.etiqueta}`}
        title={pruebaLabel}
        className={`${accionBase} ${padding}`}
      >
        {isProbando ? (
          <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />
        ) : (
          <Send size={18} strokeWidth={1.75} aria-hidden="true" />
        )}
        <span className={texto}>{pruebaLabel}</span>
      </button>
    </div>
  )
}

/**
 * Reglas de notificación: tabla desde lg y tarjetas por debajo, en el orden en que las manda el back.
 * Columnas: Canal (ícono y nombre), Etiqueta, Destino (chat_id o mail), Recibe (Services o Certificaciones), Activa
 * (switch) y Acciones (Editar · Enviar prueba). Las inactivas se ven en gris.
 * Sin `canEdit` el switch queda a la vista pero deshabilitado y no hay acciones.
 * `guardandoIds` son las reglas cuyo switch se está guardando; `probandoIds`, las que están mandando una prueba
 * @param {{
 *   reglas: ReglaNotificacion[],
 *   canEdit?: boolean,
 *   guardandoIds?: ReadonlySet<number>,
 *   probandoIds?: ReadonlySet<number>,
 *   onToggleActiva?: (regla: ReglaNotificacion, activo: boolean) => void,
 *   onEdit?: (regla: ReglaNotificacion) => void,
 *   onProbar?: (regla: ReglaNotificacion) => void,
 * }} props
 */
export default function ReglasNotificacionTable({
  reglas,
  canEdit = false,
  guardandoIds = new Set(),
  probandoIds = new Set(),
  onToggleActiva,
  onEdit,
  onProbar,
}) {
  const switchActiva = (regla) => (
    <Switch
      checked={regla.activo}
      onChange={(activo) => onToggleActiva?.(regla, activo)}
      label={`Regla ${regla.etiqueta} activa`}
      hideLabel
      disabled={!canEdit}
      isBusy={guardandoIds.has(regla.id)}
    />
  )

  const acciones = (regla, compacto) => (
    <Acciones
      regla={regla}
      isProbando={probandoIds.has(regla.id)}
      onEdit={onEdit}
      onProbar={onProbar}
      compacto={compacto}
    />
  )

  return (
    <div className="glass overflow-hidden">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10">
              <th scope="col" className={`${thBase} pl-6`}>
                Canal
              </th>
              <th scope="col" className={thBase}>
                Etiqueta
              </th>
              <th scope="col" className={thBase}>
                Destino
              </th>
              <th scope="col" className={thBase}>
                Recibe
              </th>
              <th scope="col" className={`${thBase} ${canEdit ? '' : 'pr-6'}`}>
                Activa
              </th>
              {canEdit && (
                <th scope="col" className={`${thBase} pr-4 text-right`}>
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {reglas.map((regla) => {
              const estado = estadoKey(regla)
              return (
                <tr key={regla.id} className="transition-colors duration-200 ease-glass">
                  <td className="py-3 pr-3 pl-6">
                    <Canal regla={regla} />
                  </td>
                  <td className={`min-w-40 px-3 py-3 font-medium text-pretty ${textStrong[estado]}`}>{regla.etiqueta}</td>
                  <td className={`px-3 py-3 tabular-nums break-all ${textSoft[estado]}`}>{regla.destino}</td>
                  <td className="px-3 py-3">
                    <Recibe tipo={regla.tipo_aviso} />
                  </td>
                  <td className={`py-1 pl-2 ${canEdit ? 'pr-3' : 'pr-6'}`}>{switchActiva(regla)}</td>
                  {canEdit && <td className="py-2 pr-4">{acciones(regla, true)}</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-black/5 lg:hidden dark:divide-white/10">
        {reglas.map((regla) => {
          const estado = estadoKey(regla)
          return (
            <li key={regla.id} className="flex flex-col gap-3 py-4 pr-3 pl-4 sm:pl-5">
              <div className="flex items-start gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className={`font-medium text-pretty ${textStrong[estado]}`}>{regla.etiqueta}</p>
                  <p className={`text-sm tabular-nums break-all ${textSoft[estado]}`}>{regla.destino}</p>
                </div>
                <div className="-mt-2 shrink-0">{switchActiva(regla)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <Canal regla={regla} />
                <Recibe tipo={regla.tipo_aviso} />
              </div>
              {canEdit && <div className="-ml-3.5">{acciones(regla, false)}</div>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Versión de carga: la misma superficie con filas vacías
export function ReglasNotificacionTableSkeleton() {
  return (
    <div aria-hidden="true" className="glass">
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex items-center gap-4 py-4 pr-4 pl-4 sm:pl-6">
            <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
              <span className={`h-4 w-20 ${skeletonBar}`} />
              <span className={`h-4 w-2/5 max-w-48 ${skeletonBar}`} />
              <span className={`h-4 w-3/5 max-w-56 ${skeletonBar}`} />
              <span className={`hidden h-4 w-24 lg:block ${skeletonBar}`} />
            </div>
            <span className={`h-6 w-10 rounded-full ${skeletonBar}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
