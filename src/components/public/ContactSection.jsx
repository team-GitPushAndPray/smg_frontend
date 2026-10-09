import { ArrowUpRight, Calculator, MessageCircle, ShoppingCart, Wrench } from 'lucide-react'
import { contacto } from '../../data/empresa'
import SectionHeading from './SectionHeading'

// Traduce la clave `icono` del archivo de datos a un ícono
const icons = {
  cotizaciones: Calculator,
  logistica: Wrench,
  ventas: ShoppingCart,
}

export default function ContactSection() {
  return (
    <section id="contacto" aria-labelledby="contacto-titulo" className="page-section">
      <SectionHeading
        id="contacto-titulo"
        title="Contacto"
        description="Escribinos por WhatsApp al área que necesites."
      />

      {/* En tablet, el área con más de un número ocupa dos filas y las otras dos se apilan al lado */}
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacto.map((item) => {
          const Icon = icons[item.icono]
          return (
            <li
              key={item.area}
              className={`glass flex flex-col gap-5 p-6 ${item.telefonos.length > 1 ? 'sm:row-span-2 lg:row-span-1' : ''}`}
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <span className="icon-badge">
                    <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                )}
                <div className="flex flex-col">
                  <h3 className="font-semibold">{item.area}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">WhatsApp</p>
                </div>
              </div>

              <ul className="flex flex-col gap-2">
                {item.telefonos.map((telefono) => (
                  <li key={telefono.whatsapp}>
                    <a
                      href={`https://wa.me/${telefono.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="interactive flex min-h-12 items-center gap-3 rounded-control bg-brand-600/10 px-4 text-brand-700 hover:bg-brand-600/15 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25"
                    >
                      <MessageCircle size={20} strokeWidth={1.75} aria-hidden="true" />
                      <span className="font-medium whitespace-nowrap tabular-nums">{telefono.numero}</span>
                      <span className="sr-only">por WhatsApp (se abre en una pestaña nueva)</span>
                      <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" className="ml-auto shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
