import { MapPin } from 'lucide-react'
import { linkMaps } from '../../utils/alquileres'

/** @import { AlquilerListado } from '../../types/alquileres' */

const focusRing = 'focus-visible:outline-2 focus-visible:outline-(--focus-ring)'

/**
 * Ubicación de la obra de un alquiler como enlace a Google Maps, en otra pestaña: muestra la referencia, o "Ver mapa" si
 * no tiene. Rojo de la paleta para que se lea como enlace. Sin coordenadas válidas no hay enlace: queda la referencia
 * como texto. `className` ajusta el área táctil según dónde va
 * @param {{ alquiler: Pick<AlquilerListado, 'latitud' | 'longitud' | 'ubicacion_referencia'>, className?: string }} props
 */
export default function UbicacionLink({ alquiler, className = '' }) {
  const href = linkMaps(alquiler.latitud, alquiler.longitud)
  const referencia = alquiler.ubicacion_referencia?.trim()
  if (!href) return referencia || '—'
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${referencia ? `Ubicación: ${referencia}` : 'Ver mapa'}. Abre Google Maps en otra pestaña`}
      title={referencia ? `${referencia} · Abrir en Google Maps` : 'Abrir en Google Maps'}
      className={`interactive inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-sm font-medium text-brand-700 hover:underline dark:text-brand-400 ${focusRing} ${className}`}
    >
      <MapPin size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
      <span className="truncate">{referencia || 'Ver mapa'}</span>
    </a>
  )
}
