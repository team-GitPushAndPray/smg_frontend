import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { equipoComercial } from '../../data/empresa'
import { getCargoLabel, getIniciales, getWhatsappUrl } from '../../utils/vendedores'

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
const avatarClass = 'size-20 shrink-0 rounded-full border border-(--glass-border)'

// Foto del vendedor; si no tiene o no carga, sus iniciales sobre el tinte del acento
function Avatar({ foto, nombre }) {
  const [hasError, setHasError] = useState(false)

  if (foto && !hasError) {
    // alt vacío: el nombre ya está escrito al lado, el lector de pantalla no necesita oírlo dos veces
    return (
      <img
        src={foto}
        alt=""
        loading="lazy"
        onError={() => setHasError(true)}
        className={`${avatarClass} bg-black/5 object-cover dark:bg-white/10`}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={`${avatarClass} grid place-items-center bg-brand-600/10 text-xl font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400`}
    >
      {getIniciales(nombre)}
    </span>
  )
}

// Tarjeta de un vendedor: foto, nombre, cargo, descripción y botón para escribirle por WhatsApp
export default function SalesRepCard({ nombre, cargo, descripcion, foto, contacto }) {
  const nombrePila = nombre.trim().split(/\s+/)[0]
  const whatsappUrl = getWhatsappUrl(contacto, equipoComercial.mensaje.replace('{nombre}', nombrePila))

  return (
    <li className="glass flex flex-col gap-5 p-6">
      <div className="flex items-center gap-4">
        {/* key: si cambia la foto, el avatar vuelve a intentar cargarla */}
        <Avatar key={foto} foto={foto} nombre={nombre} />
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <h3 className="text-lg font-semibold text-balance">{nombre}</h3>
          {cargo && (
            <span className="rounded-control bg-brand-600/10 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              {getCargoLabel(cargo)}
            </span>
          )}
        </div>
      </div>

      {descripcion && (
        <p className="text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-400">{descripcion}</p>
      )}

      {/* mt-auto: en la grilla los botones quedan alineados aunque las descripciones tengan distinto largo */}
      {whatsappUrl && (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-auto w-full">
          <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
          Contactar
          <span className="sr-only">{`a ${nombre} por WhatsApp (se abre en una pestaña nueva)`}</span>
        </a>
      )}
    </li>
  )
}

// Marcador con la forma de la tarjeta mientras carga el equipo
export function SalesRepCardSkeleton() {
  return (
    <li aria-hidden="true" className="glass flex flex-col gap-5 p-6">
      <div className="flex items-center gap-4">
        <span className="size-20 shrink-0 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
        <div className="flex flex-1 flex-col gap-2">
          <span className={`h-6 w-3/5 ${skeletonBar}`} />
          <span className={`h-7 w-24 ${skeletonBar}`} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className={`h-4 w-full ${skeletonBar}`} />
        <span className={`h-4 w-4/5 ${skeletonBar}`} />
      </div>
      <span className={`h-11 w-full ${skeletonBar}`} />
    </li>
  )
}
