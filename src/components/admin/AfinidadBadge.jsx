import { CircleAlert, History } from 'lucide-react'
import { getAfinidad } from '../../utils/postulaciones'
import GloboDetalle from './GloboDetalle'

/** @import { Postulacion } from '../../types/postulaciones' */

const badgeBase = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap'

const TEXTO_DESACTUALIZADO =
  'Cambiaron los requisitos de la vacante después de este análisis. Volvé a analizarla para actualizar el puntaje.'

/**
 * Estado del análisis con IA de una postulación, en la columna Afinidad de la bandeja:
 * - Sin analizar: texto gris con contorno punteado, sin número.
 * - Puntaje: el número con el color de su franja (verde 70 a 100, ámbar 40 a 69, gris 0 a 39). La franja también se
 *   lee en texto para lectores de pantalla.
 * - Desactualizado: badge al lado del puntaje (no lo reemplaza), con el motivo en un globo.
 * - No se pudo analizar: rojo, con el `error_detalle` del back en un globo (mouse o toque). Gana sobre desactualizado
 * @param {{ postulacion: Postulacion }} props
 */
export default function AfinidadBadge({ postulacion }) {
  const afinidad = getAfinidad(postulacion)

  if (afinidad.tipo === 'sin-analizar') {
    return (
      <span
        className={`${badgeBase} border border-dashed border-neutral-400 text-neutral-700 dark:border-neutral-500 dark:text-neutral-300`}
      >
        Sin analizar
      </span>
    )
  }

  if (afinidad.tipo === 'error') {
    return (
      <GloboDetalle
        titulo="Por qué no se pudo analizar"
        texto={afinidad.detalle?.trim() || 'La IA no informó el motivo.'}
        ariaLabel="No se pudo analizar: ver el detalle"
        alinear="izquierda"
      >
        {(abierto) => (
          <span
            className={`${badgeBase} bg-brand-600/10 text-brand-700 transition-colors duration-200 ease-glass group-hover:bg-brand-600/15 dark:bg-brand-500/15 dark:text-brand-300 dark:group-hover:bg-brand-500/25 ${abierto ? 'bg-brand-600/15 dark:bg-brand-500/25' : ''}`}
          >
            <CircleAlert size={14} strokeWidth={2.25} aria-hidden="true" />
            No se pudo analizar
          </span>
        )}
      </GloboDetalle>
    )
  }

  const { puntaje, franja, desactualizado } = afinidad
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className={`${badgeBase} min-w-11 justify-center font-semibold tabular-nums ${franja.className}`}>
        {puntaje}
        <span className="sr-only"> de 100: {franja.label.toLowerCase()}</span>
      </span>
      {desactualizado && (
        <GloboDetalle
          titulo="Análisis desactualizado"
          texto={TEXTO_DESACTUALIZADO}
          ariaLabel="Desactualizado: ver el motivo"
          alinear="izquierda"
        >
          {(abierto) => (
            <span
              className={`${badgeBase} text-neutral-800 ring-1 ring-neutral-500 transition-colors duration-200 ease-glass ring-inset group-hover:bg-black/5 dark:text-neutral-200 dark:ring-neutral-400 dark:group-hover:bg-white/10 ${abierto ? 'bg-black/5 dark:bg-white/10' : ''}`}
            >
              <History size={14} strokeWidth={2} aria-hidden="true" />
              Desactualizado
            </span>
          )}
        </GloboDetalle>
      )}
    </span>
  )
}
