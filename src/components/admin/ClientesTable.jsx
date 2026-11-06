import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import EstadoActivoBadge from './EstadoActivoBadge'

/** @import { Cliente } from '../../types/alquileres' */

const SKELETON_COUNT = 5
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

const COLUMNAS = ['Razón social', 'CUIT', 'Contacto', 'Teléfono', 'Localidad', 'Estado']

// Los inactivos se atenúan con un gris que igual pasa AA sobre el vidrio
const textStrong = {
  activo: 'text-black dark:text-white',
  inactivo: 'text-neutral-600 dark:text-neutral-400',
}
const textSoft = {
  activo: 'text-neutral-700 dark:text-neutral-300',
  inactivo: 'text-neutral-600 dark:text-neutral-400',
}
const textMuted = 'text-neutral-600 dark:text-neutral-400'
const rowHover = 'transition-colors duration-200 ease-glass hover:bg-black/5 dark:hover:bg-white/5'
const focusRing = 'focus-visible:outline-2 focus-visible:outline-(--focus-ring)'

function estadoKey(cliente) {
  return cliente.activo ? 'activo' : 'inactivo'
}

// Dato opcional del cliente: los vacíos se muestran como una raya
function dato(valor) {
  return valor?.trim() || '—'
}

/*
 * Clientes: tabla desde lg y tarjetas por debajo (con el sidebar abierto, las seis columnas no entran en tablet).
 * Toda la fila (o la tarjeta) abre el detalle. En la tabla el enlace real es la razón social (teclado, lectores de
 * pantalla, abrir en otra pestaña) y el resto de la fila navega con un clic; Ctrl o ⌘ + clic la abre en otra pestaña.
 * `getHref` arma la ruta del detalle
 * @param {{ clientes: Cliente[], getHref: (cliente: Cliente) => string }} props
 */
export default function ClientesTable({ clientes, getHref }) {
  const navigate = useNavigate()

  const onRowClick = (event, cliente) => {
    // El enlace de la razón social navega solo; si se está seleccionando texto de la fila (un CUIT), no se navega
    if (event.target.closest('a') || window.getSelection()?.toString()) return
    const href = getHref(cliente)
    if (event.ctrlKey || event.metaKey) window.open(href, '_blank', 'noopener')
    else navigate(href)
  }

  return (
    <div className="glass overflow-hidden">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/10">
              {COLUMNAS.map((columna) => (
                <th
                  key={columna}
                  scope="col"
                  className={`px-3 py-3.5 text-xs font-medium tracking-wide whitespace-nowrap uppercase first:pl-6 ${textMuted}`}
                >
                  {columna}
                </th>
              ))}
              <th scope="col" className="w-px py-3.5 pr-4">
                <span className="sr-only">Abrir</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {clientes.map((cliente) => {
              const estado = estadoKey(cliente)
              return (
                <tr
                  key={cliente.id}
                  onClick={(event) => onRowClick(event, cliente)}
                  className={`cursor-pointer has-[a:focus-visible]:bg-black/5 dark:has-[a:focus-visible]:bg-white/5 ${rowHover}`}
                >
                  <td className="max-w-72 py-3 pr-3 pl-6">
                    <Link
                      to={getHref(cliente)}
                      className={`block truncate rounded-sm font-medium focus-visible:outline-offset-2 ${textStrong[estado]} ${focusRing}`}
                    >
                      {cliente.razon_social}
                    </Link>
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft[estado]}`}>{dato(cliente.cuit)}</td>
                  <td className={`max-w-48 truncate px-3 py-3 ${textSoft[estado]}`}>{dato(cliente.contacto_nombre)}</td>
                  <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft[estado]}`}>
                    {dato(cliente.telefono)}
                  </td>
                  <td className={`max-w-44 truncate px-3 py-3 ${textSoft[estado]}`}>{dato(cliente.localidad)}</td>
                  <td className="px-3 py-3">
                    <EstadoActivoBadge activo={cliente.activo} />
                  </td>
                  <td className={`py-3 pr-4 ${textMuted}`}>
                    <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-black/5 lg:hidden dark:divide-white/10">
        {clientes.map((cliente) => {
          const estado = estadoKey(cliente)
          const contacto = [cliente.contacto_nombre?.trim(), cliente.telefono?.trim()].filter(Boolean).join(' · ')
          return (
            <li key={cliente.id}>
              <Link
                to={getHref(cliente)}
                className={`flex items-center gap-3 py-4 pr-3 pl-4 focus-visible:-outline-offset-2 sm:pl-5 ${rowHover} ${focusRing}`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className={`truncate font-medium ${textStrong[estado]}`}>{cliente.razon_social}</p>
                    <p className={`text-sm tabular-nums ${textSoft[estado]}`}>
                      <span className={textMuted}>CUIT </span>
                      {dato(cliente.cuit)}
                    </p>
                  </div>
                  {contacto && <p className={`truncate text-sm ${textSoft[estado]}`}>{contacto}</p>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <EstadoActivoBadge activo={cliente.activo} />
                    {cliente.localidad?.trim() && (
                      <span className={`truncate text-sm ${textSoft[estado]}`}>{cliente.localidad}</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" className={`shrink-0 ${textMuted}`} />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Versión de carga: la misma superficie con filas vacías
export function ClientesTableSkeleton() {
  return (
    <div aria-hidden="true" className="glass">
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index} className="flex items-center gap-4 py-4 pr-4 pl-4 sm:pl-6">
            <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
              <span className={`h-4 w-3/5 max-w-56 ${skeletonBar}`} />
              <span className={`h-4 w-28 ${skeletonBar}`} />
              <span className={`hidden h-4 w-28 lg:block ${skeletonBar}`} />
              <span className={`hidden h-4 w-32 lg:block ${skeletonBar}`} />
              <span className={`h-4 w-24 ${skeletonBar}`} />
            </div>
            <span className={`hidden h-5 w-16 lg:block ${skeletonBar}`} />
            <span className={`size-5 shrink-0 ${skeletonBar}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
