import { ArrowUpRight, MapPin } from 'lucide-react'
import { ubicacion } from '../../data/empresa'
import SectionHeading from './SectionHeading'

// Embed y enlace públicos de Google Maps: no necesitan API key
const query = encodeURIComponent(ubicacion.consultaMapa)
const embedUrl = `https://www.google.com/maps?q=${query}&z=16&output=embed`
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`

export default function LocationSection() {
  return (
    <section id="ubicacion" aria-labelledby="ubicacion-titulo" className="page-section">
      <SectionHeading id="ubicacion-titulo" title="Ubicación" />

      <div className="glass mt-10 grid overflow-hidden lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-10">
          <span className="icon-badge">
            <MapPin size={22} strokeWidth={1.75} aria-hidden="true" />
          </span>

          <address className="flex flex-col gap-1 not-italic">
            <span className="text-2xl font-semibold tracking-tight">{ubicacion.direccion}</span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {ubicacion.localidad} (CP {ubicacion.codigoPostal})
            </span>
          </address>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive -mx-3 inline-flex min-h-11 items-center gap-1.5 self-start rounded-control px-3 font-medium text-brand-700 hover:bg-brand-600/10 dark:text-brand-400 dark:hover:bg-brand-500/15"
          >
            Abrir en Google Maps
            <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </div>

        <iframe
          title={`Mapa: ${ubicacion.direccion}, ${ubicacion.localidad}`}
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-80 w-full border-0 sm:h-96 lg:h-full lg:min-h-112"
        />
      </div>
    </section>
  )
}
