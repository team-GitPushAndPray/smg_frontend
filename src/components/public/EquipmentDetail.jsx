import { MessageCircle, Users } from 'lucide-react'
import { consultaEquipo } from '../../data/empresa'
import { useVendedores } from '../../hooks/useVendedores'
import { describeEquipo, getCotizacionUrl } from '../../utils/equipos'
import EquipmentGallery, { EquipmentGallerySkeleton } from './EquipmentGallery'
import SalesRepList from './SalesRepList'
import SectionHeading from './SectionHeading'

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
// La galería mantiene su proporción; el panel se estira a su altura y deja los botones abajo
const layoutClass = 'grid gap-6 lg:grid-cols-[1.1fr_1fr]'
const panelClass = 'glass flex flex-col gap-6 p-6 sm:p-8'

// Lleva al bloque del equipo comercial, con scroll suave salvo que se haya pedido menos movimiento
function scrollToConsulta() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById('consulta')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

/*
 * Detalle de un equipo del catálogo: galería, tipo, marca, modelo y descripción,
 * el botón para cotizarlo por WhatsApp y el equipo comercial con el equipo ya escrito en cada mensaje.
 */
export default function EquipmentDetail({ equipo }) {
  const { tipo, marca, modelo, nombre, descripcion, esAditamento } = describeEquipo(equipo)
  const { hasEquipo } = useVendedores()

  return (
    <>
      <div className={layoutClass}>
        <EquipmentGallery esAditamento={esAditamento} />

        <div className={panelClass}>
          <div className="flex flex-col items-start gap-4">
            <span className="rounded-control bg-brand-600/10 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              {tipo}
            </span>
            <h1 id="detalle-titulo" className="flex flex-col gap-1">
              <span className="text-3xl font-semibold text-balance sm:text-4xl">{marca}</span>
              {modelo && <span className="text-xl text-neutral-600 dark:text-neutral-400">{modelo}</span>}
            </h1>
          </div>

          {descripcion && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-neutral-600 uppercase dark:text-neutral-400">
                Descripción
              </h2>
              <p className="leading-relaxed text-pretty text-neutral-700 dark:text-neutral-300">{descripcion}</p>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2 border-t border-(--glass-border) pt-6">
            <a
              href={getCotizacionUrl(nombre)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
              Cotizar equipo
              <span className="sr-only">por WhatsApp (se abre en una pestaña nueva)</span>
            </a>
            {hasEquipo && (
              <button type="button" onClick={scrollToConsulta} className="btn-tonal">
                <Users size={18} strokeWidth={1.75} aria-hidden="true" />
                Hablar con un vendedor
              </button>
            )}
          </div>
        </div>
      </div>

      {hasEquipo && (
        <section id="consulta" aria-labelledby="consulta-titulo" className="scroll-mt-24 pt-16 sm:pt-24">
          <SectionHeading
            id="consulta-titulo"
            eyebrow="Equipo comercial"
            title={consultaEquipo.titulo}
            description={consultaEquipo.bajada}
          />
          <div className="mt-10">
            <SalesRepList mensaje={consultaEquipo.mensaje.replace('{equipo}', nombre)} />
          </div>
        </section>
      )}
    </>
  )
}

// Marcador con la forma del detalle mientras carga el equipo
export function EquipmentDetailSkeleton() {
  return (
    <div aria-hidden="true" className={layoutClass}>
      <EquipmentGallerySkeleton />
      <div className={panelClass}>
        <div className="flex flex-col gap-4">
          <span className={`h-7 w-28 ${skeletonBar}`} />
          <span className={`h-10 w-3/5 ${skeletonBar}`} />
          <span className={`h-6 w-2/5 ${skeletonBar}`} />
        </div>
        <div className="flex flex-col gap-2">
          <span className={`h-4 w-24 ${skeletonBar}`} />
          <span className={`h-4 w-full ${skeletonBar}`} />
          <span className={`h-4 w-4/5 ${skeletonBar}`} />
        </div>
        <div className="mt-auto flex flex-col gap-2 border-t border-(--glass-border) pt-6">
          <span className={`h-11 ${skeletonBar}`} />
          <span className={`h-11 ${skeletonBar}`} />
        </div>
      </div>
    </div>
  )
}
