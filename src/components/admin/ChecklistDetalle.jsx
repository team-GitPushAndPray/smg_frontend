import { ChevronDown, TriangleAlert } from 'lucide-react'
import { useId, useState } from 'react'
import { getTituloEquipo } from '../../utils/equipos'
import {
  contar,
  formatFechaChecklist,
  formatHorasChecklist,
  getTipoChecklist,
  separarRespuestas,
} from '../../utils/historial'
import EstadoItemBadge from './EstadoItemBadge'
import GaleriaFotos from './GaleriaFotos'

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
const sectionClass = 'glass flex flex-col gap-4 p-5 sm:gap-5 sm:p-6'

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
// Texto libre escrito por el operario: respeta sus saltos de línea y corta palabras largas sin desbordar
const textoLibre = 'leading-relaxed text-pretty break-words whitespace-pre-line'

const ANORMALES = { one: 'ítem anormal', other: 'ítems anormales' }
const FOTOS = { one: 'foto', other: 'fotos' }

// Cómo se cuenta cada estado en el resumen del bloque colapsable ("15 normales · 3 no aplica")
const RESUMEN_ESTADOS = [
  { estado: 'NORMAL', noun: { one: 'normal', other: 'normales' } },
  { estado: 'NO_APLICA', noun: { one: 'no aplica', other: 'no aplica' } },
]
const OTROS = { one: 'otro', other: 'otros' }

function getResumen(respuestas) {
  const partes = RESUMEN_ESTADOS.map(({ estado, noun }) => {
    const cantidad = respuestas.filter((respuesta) => respuesta.estado === estado).length
    return cantidad > 0 ? contar(cantidad, noun) : null
  })
  const conocidos = new Set(RESUMEN_ESTADOS.map(({ estado }) => estado))
  const otros = respuestas.filter((respuesta) => !conocidos.has(respuesta.estado)).length
  if (otros > 0) partes.push(contar(otros, OTROS))
  return partes.filter(Boolean).join(' · ')
}

// Un dato de la cabecera: etiqueta y valor. Lo que no vino se muestra atenuado
function Dato({ label, value, children }) {
  const isEmpty = !children && (value == null || value === '')
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className={`text-sm ${textMuted}`}>{label}</dt>
      <dd className={isEmpty ? textMuted : `font-medium break-words tabular-nums ${textStrong}`}>
        {children ?? (isEmpty ? 'Sin registrar' : value)}
      </dd>
    </div>
  )
}

function Seccion({ id, title, count, children }) {
  return (
    <section aria-labelledby={id} className={sectionClass}>
      <h2 id={id} className="flex items-baseline gap-2 text-lg font-semibold">
        {title}
        {count != null && <span className={`text-base font-normal tabular-nums ${textMuted}`}>{count}</span>}
      </h2>
      {children}
    </section>
  )
}

/*
 * Ítem anormal: resaltado con el tinte del acento y una franja roja a la izquierda, el badge "✕ Anormal" y, si la
 * cargó, la observación del operario. Sin observación no queda ningún bloque vacío
 */
function ItemAnormal({ respuesta }) {
  return (
    <li className="flex flex-col gap-2.5 rounded-control border border-l-4 border-brand-600/25 border-l-brand-600 bg-brand-600/5 py-3.5 pr-4 pl-3.5 dark:border-brand-400/30 dark:border-l-brand-400 dark:bg-brand-500/10">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <h3 className={`min-w-0 font-semibold break-words ${textStrong}`}>{respuesta.item}</h3>
        <EstadoItemBadge estado={respuesta.estado} />
      </div>
      {respuesta.observacion && (
        <p className={`text-neutral-800 dark:text-neutral-200 ${textoLibre}`}>
          <span className="sr-only">Observación: </span>
          {respuesta.observacion}
        </p>
      )}
    </li>
  )
}

/*
 * Ítems NORMAL y NO_APLICA (y alguno con un estado desconocido) en un bloque colapsable, cerrado al entrar: lo que
 * importa son los anormales. El encabezado resume cuántos hay de cada estado, así no hace falta abrirlo para saberlo
 */
function RestoRespuestas({ respuestas, hayAnormales }) {
  const [abierto, setAbierto] = useState(false)
  const listId = useId()

  return (
    <section className="glass overflow-hidden">
      <h2>
        <button
          type="button"
          onClick={() => setAbierto((actual) => !actual)}
          aria-expanded={abierto}
          aria-controls={listId}
          className="ease-glass flex min-h-16 w-full items-center gap-3 px-5 py-4 text-left transition-colors duration-200 hover:bg-black/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus-ring) sm:px-6 dark:hover:bg-white/5"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-lg font-semibold">{hayAnormales ? 'Resto de los ítems' : 'Ítems revisados'}</span>
            <span className={`text-sm font-normal ${textMuted}`}>{getResumen(respuestas)}</span>
          </span>
          <span className={`shrink-0 text-sm font-medium ${textSoft} hidden sm:inline`}>
            {abierto ? 'Ocultar' : 'Ver todos'}
          </span>
          <ChevronDown
            size={20}
            strokeWidth={1.75}
            aria-hidden="true"
            className={`ease-glass shrink-0 transition-transform duration-200 ${textMuted} ${abierto ? 'rotate-180' : ''}`}
          />
        </button>
      </h2>

      <ul id={listId} hidden={!abierto} className="divide-y divide-black/5 border-t border-black/5 dark:divide-white/10 dark:border-white/10">
        {respuestas.map((respuesta) => (
          <li key={respuesta.id} className="flex flex-col gap-1.5 px-5 py-3.5 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <span className={`min-w-0 pt-0.5 break-words ${textStrong}`}>{respuesta.item}</span>
              <EstadoItemBadge estado={respuesta.estado} />
            </div>
            {respuesta.observacion && (
              <p className={`text-sm ${textSoft} ${textoLibre}`}>
                <span className="sr-only">Observación: </span>
                {respuesta.observacion}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/*
 * Detalle de un checklist del historial, de solo lectura. De arriba a abajo, en el orden en que se lo revisa:
 * cabecera (tipo, fecha y hora, horas de motor si es una máquina, responsable y cuántos anormales), los ítems
 * ANORMAL con su observación, las observaciones generales, las fotos y, colapsados, el resto de los ítems.
 * Cada bloque aparece solo si tiene contenido: un checklist sin anormales, observaciones ni fotos no deja huecos
 */
export default function ChecklistDetalle({ checklist, equipo }) {
  const { anormales, resto } = separarRespuestas(checklist.respuestas)
  const momento = formatFechaChecklist(checklist.fecha)
  const { Icon, label } = getTipoChecklist(checklist.tipo)
  const esMaquina = equipo.tipo === 'maquina'

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <header className="flex items-center gap-3 sm:gap-4">
        <span className="icon-badge">
          <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className={`text-sm font-medium break-words ${textMuted}`}>Checklist de {getTituloEquipo(equipo)}</p>
          <h1 className="text-2xl font-semibold text-balance break-words sm:text-3xl">{label}</h1>
        </div>
      </header>

      <section aria-label="Datos del checklist" className="glass p-5 sm:p-6">
        <dl className={`grid gap-x-6 gap-y-5 sm:grid-cols-2 ${esMaquina ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          <Dato label="Fecha y hora" value={momento ? `${momento.fecha} · ${momento.hora}` : null} />
          {esMaquina && (
            <Dato
              label="Horas motor"
              value={checklist.horasMotor != null ? formatHorasChecklist(checklist.horasMotor, esMaquina) : null}
            />
          )}
          <Dato label="Responsable" value={checklist.responsable} />
          <Dato label="Resultado">
            {anormales.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-brand-700 dark:text-brand-400">
                <TriangleAlert size={18} strokeWidth={2} aria-hidden="true" className="shrink-0" />
                {contar(anormales.length, ANORMALES)}
              </span>
            ) : (
              'Sin anormales'
            )}
          </Dato>
        </dl>
      </section>

      {anormales.length > 0 && (
        <Seccion id="items-anormales" title="Ítems anormales" count={anormales.length}>
          <ul className="flex flex-col gap-3">
            {anormales.map((respuesta) => (
              <ItemAnormal key={respuesta.id} respuesta={respuesta} />
            ))}
          </ul>
        </Seccion>
      )}

      {checklist.observaciones && (
        <Seccion id="observaciones-generales" title="Observaciones generales">
          <p className={`${textSoft} ${textoLibre}`}>{checklist.observaciones}</p>
        </Seccion>
      )}

      {checklist.fotos.length > 0 && (
        <Seccion id="fotos" title="Fotos" count={checklist.fotos.length}>
          <p className="sr-only">{contar(checklist.fotos.length, FOTOS)}. Elegí una para verla ampliada.</p>
          <GaleriaFotos fotos={checklist.fotos} />
        </Seccion>
      )}

      {resto.length > 0 && <RestoRespuestas respuestas={resto} hayAnormales={anormales.length > 0} />}
    </div>
  )
}

// Marcador con la forma del detalle (cabecera, datos y dos bloques) mientras carga
export function ChecklistDetalleSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4 sm:gap-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className={`size-11 shrink-0 ${skeletonBar}`} />
        <div className="flex flex-1 flex-col gap-2">
          <span className={`h-4 w-56 max-w-full ${skeletonBar}`} />
          <span className={`h-8 w-48 max-w-full ${skeletonBar}`} />
        </div>
      </div>
      <div className="glass grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <span className={`h-3.5 w-20 ${skeletonBar}`} />
            <span className={`h-5 w-32 ${skeletonBar}`} />
          </div>
        ))}
      </div>
      <span className={`h-48 w-full ${skeletonBar}`} />
      <span className={`h-20 w-full ${skeletonBar}`} />
    </div>
  )
}
