import { CircleX, MapPin, MessageCircle } from 'lucide-react'
import { Link } from 'react-router'
import { RUTAS_ALQUILERES } from '../../config/rutasPanel'
import {
  contarChecklistsEquipos,
  formatFechaAlquiler,
  formatFechaHoraAlquiler,
  getVencimiento,
  linkMaps,
  nombreCompleto,
} from '../../utils/alquileres'
import { getWhatsappUrl } from '../../utils/vendedores'
import AlquilerEquipoCard from './AlquilerEquipoCard'
import EstadoAlquilerBadge from './EstadoAlquilerBadge'
import PermissionBadge from './PermissionBadge'
import VencimientoTag from './VencimientoTag'

/** @import { ReactNode } from 'react' */
/** @import { AlquilerDetalle } from '../../types/alquileres' */

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
const sectionClass = 'glass flex flex-col gap-5 p-6 sm:p-8'
const gridClass = 'grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'

// Enlace dentro de un dato: rojo de la paleta para que se lea como tal, con 44px de alto sin correr el renglón
const linkClass =
  'interactive -my-3 inline-flex min-h-11 max-w-full items-center gap-1.5 self-start rounded-sm font-medium text-brand-700 hover:underline dark:text-brand-400'

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : ''
}

// Un dato del alquiler: etiqueta y contenido. Sin contenido se muestra "—", atenuado. `wide` ocupa toda la fila
function Dato({ label, wide = false, children }) {
  const isMissing = children == null || children === '' || children === false
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${wide ? 'sm:col-span-full' : ''}`}>
      <dt className={`text-sm ${textMuted}`}>{label}</dt>
      <dd className={isMissing ? textMuted : `flex min-w-0 flex-col gap-1 font-medium break-words ${textStrong}`}>
        {isMissing ? '—' : children}
      </dd>
    </div>
  )
}

// Referencia de la obra y, si las coordenadas sirven, el enlace a Google Maps en otra pestaña. null si no hay nada
function contenidoUbicacion(alquiler) {
  const referencia = texto(alquiler.ubicacion_referencia)
  const href = linkMaps(alquiler.latitud, alquiler.longitud)
  if (!referencia && !href) return null
  return (
    <>
      {referencia && <span>{referencia}</span>}
      {href && (
        <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <MapPin size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          Ver en Google Maps
          <span className="sr-only"> (abre en otra pestaña)</span>
        </a>
      )}
    </>
  )
}

// Contacto en obra: nombre y teléfono, que abre WhatsApp como el resto de los teléfonos del sistema. null si no hay nada
function contenidoContactoObra(alquiler) {
  const nombre = texto(alquiler.contacto_obra_nombre)
  const telefono = texto(alquiler.contacto_obra_telefono)
  const whatsapp = getWhatsappUrl(telefono)
  if (!nombre && !telefono) return null
  return (
    <>
      {nombre && <span>{nombre}</span>}
      {telefono &&
        (whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} tabular-nums`}
            aria-label={`Escribir por WhatsApp al ${telefono} (abre en otra pestaña)`}
          >
            <MessageCircle size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
            {telefono}
          </a>
        ) : (
          <span className="tabular-nums">{telefono}</span>
        ))}
    </>
  )
}

// Quién dio de alta el alquiler y cuándo
function CreadoPor({ alquiler }) {
  const autor = nombreCompleto(alquiler.creado_por?.nombre, alquiler.creado_por?.apellido)
  return (
    <>
      <span>{autor || 'Usuario desconocido'}</span>
      <span className={`text-sm font-normal tabular-nums ${textMuted}`}>{formatFechaHoraAlquiler(alquiler.creado_en)}</span>
    </>
  )
}

// Aviso de alquiler anulado, arriba de los datos, con el motivo que se cargó al anularlo
function AvisoAnulado({ motivo }) {
  const detalle = texto(motivo)
  return (
    <section aria-labelledby="alquiler-anulado" className="glass flex items-start gap-4 p-5 sm:p-6">
      <span className="icon-badge">
        <CircleX size={20} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-col gap-1 pt-0.5">
        <h2 id="alquiler-anulado" className="font-semibold">
          Alquiler anulado
        </h2>
        <p className={`text-sm ${textMuted}`}>Motivo de la anulación</p>
        {detalle ? (
          <p className={`leading-relaxed text-pretty break-words whitespace-pre-line ${textStrong}`}>{detalle}</p>
        ) : (
          <p className={textMuted}>No se registró el motivo.</p>
        )}
      </div>
    </section>
  )
}

/**
 * Detalle de un alquiler: encabezado con el número, el estado y el aviso de vencimiento; si está anulado, el motivo;
 * los datos (cliente con enlace a su detalle, fechas, ubicación, contacto en obra, alta y observaciones) y una tarjeta
 * por equipo con su entrega y su devolución.
 * `acciones` son los botones del encabezado (prorrogar, cambiar ubicación, anular): llegan armados desde la página.
 * `hoy` es la fecha contra la que se calcula el vencimiento
 * @param {{ alquiler: AlquilerDetalle, puedeEditar: boolean, hoy: Date, acciones?: ReactNode }} props
 */
export default function AlquilerDetail({ alquiler, puedeEditar, hoy, acciones = null }) {
  const equipos = alquiler.equipos ?? []
  const { entregados, devueltos, total } = contarChecklistsEquipos(equipos)
  const cliente = alquiler.cliente
  const observaciones = texto(alquiler.observaciones)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold tabular-nums sm:text-3xl">Alquiler N.º {alquiler.id}</h1>
            {!puedeEditar && <PermissionBadge puedeEditar={false} />}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <EstadoAlquilerBadge estado={alquiler.estado} />
            <VencimientoTag vencimiento={getVencimiento(alquiler, hoy)} className="text-sm" />
          </div>
        </div>
        {acciones && <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div>}
      </header>

      {alquiler.estado === 'ANULADO' && <AvisoAnulado motivo={alquiler.motivo_anulacion} />}

      <section aria-labelledby="datos-alquiler" className={sectionClass}>
        <h2 id="datos-alquiler" className="text-lg font-semibold">
          Datos
        </h2>
        <dl className={gridClass}>
          <Dato label="Cliente">
            {cliente?.id != null ? (
              <Link to={RUTAS_ALQUILERES.cliente(cliente.id)} className={linkClass}>
                <span className="break-words">{cliente.razon_social}</span>
              </Link>
            ) : (
              texto(cliente?.razon_social)
            )}
          </Dato>
          <Dato label="Inicio">
            <span className="tabular-nums">{formatFechaAlquiler(alquiler.fecha_inicio)}</span>
          </Dato>
          <Dato label="Fin prevista">
            <span className="tabular-nums">{formatFechaAlquiler(alquiler.fecha_fin_prevista)}</span>
          </Dato>
          <Dato label="Ubicación">{contenidoUbicacion(alquiler)}</Dato>
          <Dato label="Contacto en obra">{contenidoContactoObra(alquiler)}</Dato>
          <Dato label="Creado por">
            <CreadoPor alquiler={alquiler} />
          </Dato>
          <Dato label="Observaciones" wide>
            {observaciones && (
              <span className={`leading-relaxed font-normal text-pretty whitespace-pre-line ${textSoft}`}>
                {observaciones}
              </span>
            )}
          </Dato>
        </dl>
      </section>

      <section aria-labelledby="equipos-alquiler" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="equipos-alquiler" className="text-lg font-semibold">
            Equipos
          </h2>
          {total > 0 && (
            <p className={`text-sm tabular-nums ${textMuted}`}>
              Entregados {entregados}/{total} · Devueltos {devueltos}/{total}
            </p>
          )}
        </div>
        {total > 0 ? (
          <ul className="grid gap-4 2xl:grid-cols-2">
            {equipos.map((equipo) => (
              <AlquilerEquipoCard
                key={equipo.id}
                alquilerId={alquiler.id}
                estado={alquiler.estado}
                equipo={equipo}
                puedeEditar={puedeEditar}
              />
            ))}
          </ul>
        ) : (
          <p className={`glass p-6 ${textMuted}`}>Este alquiler no tiene equipos.</p>
        )}
      </section>
    </div>
  )
}

function SkeletonEquipo() {
  return (
    <div className="glass flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <span className={`h-6 w-24 ${skeletonBar}`} />
        <span className={`h-4 w-40 ${skeletonBar}`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <span className={`h-28 ${skeletonBar}`} />
        <span className={`h-28 ${skeletonBar}`} />
      </div>
    </div>
  )
}

// Marcador con la forma del detalle mientras carga el alquiler
export function AlquilerDetailSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className={`h-9 w-56 max-w-full ${skeletonBar}`} />
        <span className={`h-6 w-28 ${skeletonBar}`} />
      </div>
      <div className={sectionClass}>
        <span className={`h-6 w-20 ${skeletonBar}`} />
        <div className={gridClass}>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <span className={`h-4 w-24 ${skeletonBar}`} />
              <span className={`h-5 w-3/5 ${skeletonBar}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className={`h-6 w-24 ${skeletonBar}`} />
        <SkeletonEquipo />
        <SkeletonEquipo />
      </div>
    </div>
  )
}
