import { BrickWall, CalendarClock, LandPlot, Shovel, Tag, Truck } from 'lucide-react'
import { servicios } from '../../data/empresa'
import SectionHeading from './SectionHeading'

// Traduce la clave `icono` del archivo de datos a un ícono
const icons = {
  venta: Tag,
  alquiler: CalendarClock,
  movimientoSuelos: Shovel,
  limpiezaTerrenos: LandPlot,
  fletes: Truck,
  materiales: BrickWall,
}

export default function ServicesSection() {
  return (
    <section id="servicios" aria-labelledby="servicios-titulo" className="page-section">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <SectionHeading id="servicios-titulo" eyebrow="Servicios" title={servicios.titulo} />
          <div className="flex flex-col gap-4 leading-relaxed text-pretty text-neutral-700 dark:text-neutral-300">
            {servicios.parrafos.map((parrafo) => (
              <p key={parrafo}>{parrafo}</p>
            ))}
          </div>
        </div>

        <ul className="grid content-start gap-4 sm:grid-cols-2">
          {servicios.tarjetas.map((tarjeta) => {
            const Icon = icons[tarjeta.icono]
            return (
              <li key={tarjeta.titulo} className="glass flex flex-col gap-4 p-6">
                {Icon && (
                  <span className="icon-badge">
                    <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                )}
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-semibold">{tarjeta.titulo}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {tarjeta.descripcion}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
