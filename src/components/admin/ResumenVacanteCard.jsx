import { ChevronDown, ChevronRight, History, Info, Lightbulb, LoaderCircle, RefreshCw, RotateCw, Sparkles } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router'
import { RUTAS_POSTULACIONES } from '../../config/rutasPanel'
import { formatFechaHoraArgentina } from '../../utils/notificaciones'
import { getFranjaAfinidad } from '../../utils/postulaciones'
import {
  formatBaseResumen,
  formatPosicionResumen,
  guardarResumenColapsado,
  leerResumenColapsado,
} from '../../utils/vacantes'
import GloboDetalle from './GloboDetalle'

/** @import { ResumenVacante, TopCandidatoResumen } from '../../types/vacantes' */
/** @import { useResumenVacante } from '../../hooks/useResumenVacante' */

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-800 dark:text-neutral-200'
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const badgeBase = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap'
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
// Bloque dentro de la card: tinte sin vidrio, para no apilar una segunda capa
const bloque = 'rounded-control bg-black/[0.035] dark:bg-white/[0.06]'
const tituloSeccion = `text-xs font-medium tracking-wide uppercase ${textMuted}`

const TEXTO_DESACTUALIZADO =
  'Hay análisis nuevos o cambiaron los requisitos de la vacante después de generar este resumen. Regeneralo para actualizarlo.'

const AVISO_IA = 'Recomendación generada por IA. La decisión final es de la empresa.'

function PuntajeBadge({ puntaje }) {
  if (typeof puntaje !== 'number') {
    return <span className={`${badgeBase} bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300`}>Sin puntaje</span>
  }
  const franja = getFranjaAfinidad(puntaje)
  return (
    <span className={`${badgeBase} min-w-11 justify-center font-semibold tabular-nums ${franja.className}`}>
      {puntaje}
      <span className="sr-only"> de 100: {franja.label.toLowerCase()}</span>
    </span>
  )
}

/**
 * Un candidato del top: toda la tarjeta abre su ficha. El puesto va con el tinte del acento, como el top de la bandeja
 * @param {{ candidato: TopCandidatoResumen, linkState?: object }} props
 */
function CandidatoTop({ candidato, linkState }) {
  const nombre = candidato.nombre?.trim() || `Postulación #${candidato.postulacion_id}`
  return (
    <li className="flex">
      <Link
        to={RUTAS_POSTULACIONES.ficha(candidato.postulacion_id)}
        state={linkState}
        className={`interactive group flex w-full flex-col gap-2.5 p-4 hover:bg-black/[0.06] dark:hover:bg-white/10 ${bloque}`}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="inline-flex h-7 items-center rounded-full bg-brand-600/10 px-2.5 text-xs font-semibold text-brand-700 tabular-nums dark:bg-brand-500/15 dark:text-brand-300">
            <span className="sr-only">Puesto </span>
            {formatPosicionResumen(candidato.posicion)}
          </span>
          <PuntajeBadge puntaje={candidato.puntaje} />
        </span>
        <span className={`font-semibold text-pretty ${textStrong}`}>{nombre}</span>
        <span className={`text-sm text-pretty ${textSoft}`}>{candidato.motivo}</span>
        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-brand-700 dark:text-brand-400">
          Ver ficha
          <ChevronRight
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="transition-transform duration-200 ease-glass group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </span>
      </Link>
    </li>
  )
}

function DesactualizadoBadge() {
  return (
    <GloboDetalle
      titulo="Resumen desactualizado"
      texto={TEXTO_DESACTUALIZADO}
      ariaLabel="Desactualizado: hay análisis nuevos. Ver el detalle"
    >
      {(abierto) => (
        <span
          className={`${badgeBase} text-neutral-800 ring-1 ring-neutral-500 transition-colors duration-200 ease-glass ring-inset group-hover:bg-black/5 dark:text-neutral-200 dark:ring-neutral-400 dark:group-hover:bg-white/10 ${abierto ? 'bg-black/5 dark:bg-white/10' : ''}`}
        >
          <History size={14} strokeWidth={2} aria-hidden="true" />
          Desactualizado: hay análisis nuevos
        </span>
      )}
    </GloboDetalle>
  )
}

function AvisoIa() {
  return (
    <p className={`flex items-start gap-2 text-xs text-pretty ${textMuted}`}>
      <Info size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
      <span>{AVISO_IA}</span>
    </p>
  )
}

/**
 * Contenido con un resumen generado: top 3, comparación, recomendación (destacada) y el pie con la fecha, la base del
 * análisis, "Desactualizado" y "Regenerar"
 * @param {{ resumen: ResumenVacante, puedeEditar: boolean, onRegenerar: () => void, linkState?: object }} props
 */
function ContenidoResumen({ resumen, puedeEditar, onRegenerar, linkState }) {
  const top = [...resumen.top].sort((a, b) => a.posicion - b.posicion)

  return (
    <>
      <section aria-label="Top 3 de candidatos" className="flex flex-col gap-2.5">
        <h3 className={tituloSeccion}>Top {top.length || 3}</h3>
        {top.length > 0 ? (
          <ol className="grid gap-3 md:grid-cols-3">
            {top.map((candidato) => (
              <CandidatoTop key={candidato.postulacion_id} candidato={candidato} linkState={linkState} />
            ))}
          </ol>
        ) : (
          <p className={`px-4 py-3 text-sm ${textSoft} ${bloque}`}>La IA no destacó candidatos en este resumen.</p>
        )}
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className={tituloSeccion}>Comparación</h3>
        <p className={`text-pretty whitespace-pre-line ${textSoft}`}>{resumen.comparacion}</p>
      </section>

      <section className="flex gap-3 rounded-control bg-brand-600/[0.06] p-4 ring-1 ring-brand-600/15 ring-inset sm:p-5 dark:bg-brand-500/10 dark:ring-brand-400/20">
        <Lightbulb
          size={20}
          strokeWidth={1.75}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-brand-700 dark:text-brand-300"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-xs font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-300">
            Recomendación
          </h3>
          <p className={`font-medium text-pretty whitespace-pre-line ${textStrong}`}>{resumen.recomendacion}</p>
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-black/5 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <p className={`text-sm text-pretty ${textMuted}`}>
          Generado el <span className="tabular-nums">{formatFechaHoraArgentina(resumen.generado_en)}</span> (hora de
          Argentina) · {formatBaseResumen(resumen.cantidad_analizadas)}
        </p>
        {(resumen.desactualizado || puedeEditar) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:justify-end">
            {resumen.desactualizado && <DesactualizadoBadge />}
            {puedeEditar && (
              <button type="button" onClick={onRegenerar} className="btn-tonal px-4 text-sm">
                <RefreshCw size={16} strokeWidth={1.75} aria-hidden="true" />
                Regenerar
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function ResumenSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((indice) => (
          <span key={indice} className={`h-28 ${skeletonBar}`} />
        ))}
      </div>
      <span className={`h-4 w-4/5 ${skeletonBar}`} />
      <span className={`h-4 w-3/5 ${skeletonBar}`} />
    </div>
  )
}

/**
 * Card del resumen de la vacante para gerencia, arriba de la tabla de la bandeja cuando hay una vacante elegida:
 * - Cargando: barras vacías.
 * - Error al pedirlo: el aviso y "Reintentar".
 * - Generando: "Analizando a los candidatos…" (puede tardar unos segundos).
 * - Sin resumen: "Todavía no hay un resumen de esta vacante" y "Generar resumen" (solo con edición).
 * - Con resumen: top 3 (cada uno abre su ficha), comparación, recomendación destacada, fecha en hora de Argentina,
 *   cuántas postulaciones se analizaron, "Desactualizado" y "Regenerar" (solo con edición).
 * El aviso de que la recomendación es de la IA está siempre a la vista. Se colapsa desde el encabezado para que no
 * tape la tabla, y se recuerda colapsada para las demás vacantes. Una vacante que no existe (404) no muestra la card
 * @param {{
 *   resumenVacante: ReturnType<typeof useResumenVacante>,
 *   vacanteTitulo?: string,
 *   puedeEditar: boolean,
 *   linkState?: object,
 * }} props
 */
export default function ResumenVacanteCard({ resumenVacante, vacanteTitulo, puedeEditar, linkState }) {
  const { status, resumen, generando, isRefreshing, generar, retry } = resumenVacante
  const [colapsada, setColapsada] = useState(leerResumenColapsado)
  const tituloId = useId()
  const contenidoId = useId()

  if (status === 'not-found') return null

  const alternar = () => {
    const siguiente = !colapsada
    setColapsada(siguiente)
    guardarResumenColapsado(siguiente)
  }

  let contenido
  if (status === 'loading') {
    contenido = (
      <>
        <p role="status" className="sr-only">
          Cargando el resumen de la vacante…
        </p>
        <ResumenSkeleton />
      </>
    )
  } else if (generando) {
    contenido = (
      <div className={`flex items-center gap-3 px-4 py-5 ${bloque}`}>
        <LoaderCircle
          size={20}
          strokeWidth={1.75}
          aria-hidden="true"
          className="shrink-0 animate-spin text-brand-700 motion-reduce:animate-none dark:text-brand-300"
        />
        <div className="flex flex-col gap-0.5">
          <p role="status" className={`font-medium ${textStrong}`}>
            Analizando a los candidatos…
          </p>
          <p className={`text-sm ${textMuted}`}>Puede tardar unos segundos.</p>
        </div>
      </div>
    )
  } else if (status === 'error') {
    contenido = (
      <div role="alert" className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm text-pretty ${textSoft}`}>
          No pudimos cargar el resumen. Revisá tu conexión o intentá de nuevo en unos minutos.
        </p>
        <button type="button" onClick={retry} disabled={isRefreshing} className="btn-tonal shrink-0 px-4 text-sm">
          <RotateCw size={16} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    )
  } else if (!resumen) {
    contenido = (
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <p className={`font-medium ${textStrong}`}>Todavía no hay un resumen de esta vacante</p>
          <p className={`text-sm text-pretty ${textMuted}`}>
            {puedeEditar
              ? 'Generalo para ver el top 3 y una recomendación a partir de las postulaciones analizadas.'
              : 'Cuando alguien con permiso de edición lo genere, va a aparecer acá.'}
          </p>
        </div>
        {puedeEditar && (
          <button type="button" onClick={generar} className="btn-primary shrink-0 px-4 text-sm">
            <Sparkles size={16} strokeWidth={1.75} aria-hidden="true" />
            Generar resumen
          </button>
        )}
      </div>
    )
  } else {
    contenido = (
      <ContenidoResumen resumen={resumen} puedeEditar={puedeEditar} onRegenerar={generar} linkState={linkState} />
    )
  }

  const conAviso = status !== 'loading' && status !== 'error'

  return (
    <section aria-labelledby={tituloId} className="glass overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <span className="icon-badge">
          <Sparkles size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 id={tituloId} className={`font-semibold tracking-tight ${textStrong}`}>
            Resumen de la vacante
          </h2>
          <p className={`truncate text-sm ${textMuted}`}>{vacanteTitulo || 'Top 3 y recomendación generados por IA'}</p>
        </div>
        <button
          type="button"
          onClick={alternar}
          aria-expanded={!colapsada}
          aria-controls={contenidoId}
          aria-label={colapsada ? 'Mostrar el resumen de la vacante' : 'Ocultar el resumen de la vacante'}
          className="interactive inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <span aria-hidden="true" className="hidden sm:inline">
            {colapsada ? 'Mostrar' : 'Ocultar'}
          </span>
          <ChevronDown
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
            className={`transition-transform duration-200 ease-glass motion-reduce:transition-none ${colapsada ? '' : 'rotate-180'}`}
          />
        </button>
      </header>

      <div
        id={contenidoId}
        hidden={colapsada}
        aria-busy={status === 'loading' || generando}
        className="flex flex-col gap-5 border-t border-black/5 px-4 pt-4 pb-5 sm:px-6 dark:border-white/10"
      >
        {contenido}
        {conAviso && <AvisoIa />}
      </div>
    </section>
  )
}
