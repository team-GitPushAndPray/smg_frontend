import { ChevronRight, MessageCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { getWhatsappUrl } from '../../utils/vendedores'
import ClienteActionsMenu from './ClienteActionsMenu'
import EstadoActivoBadge from './EstadoActivoBadge'

/** @import { Cliente } from '../../types/alquileres' */

const SKELETON_COUNT = 5
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

const COLUMNAS = ['Razón social', 'CUIT', 'Contacto', 'Teléfono', 'Dirección', 'Estado']

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
 * Teléfono del cliente como enlace a WhatsApp (wa.me, en otra pestaña), igual que los teléfonos del portal: a un
 * número local se le agrega 54 + 9. Rojo de la paleta para que se lea como enlace (pasa AA sobre el vidrio).
 * Sin un número válido se muestra como texto. `className` ajusta el área táctil según dónde va
 */
function TelefonoWhatsapp({ cliente, className = '' }) {
  const telefono = cliente.telefono?.trim()
  const href = getWhatsappUrl(telefono)
  if (!href) return dato(telefono)
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Escribir por WhatsApp a ${cliente.razon_social}: ${telefono} (se abre en otra pestaña)`}
      title="Escribir por WhatsApp"
      className={`interactive inline-flex items-center gap-1.5 rounded-sm font-medium text-brand-700 tabular-nums hover:underline dark:text-brand-400 ${focusRing} ${className}`}
    >
      <MessageCircle size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
      {telefono}
    </a>
  )
}

/**
 * Clientes: tabla desde lg y tarjetas por debajo (con el sidebar abierto, las seis columnas no entran en tablet).
 * Contacto muestra el email y Dirección, la dirección; el teléfono abre WhatsApp.
 * Toda la fila (o la tarjeta) abre el detalle. En la tabla el enlace real es la razón social (teclado, lectores de
 * pantalla, abrir en otra pestaña) y el resto de la fila navega con un clic; Ctrl o ⌘ + clic la abre en otra pestaña.
 * En la tarjeta, el enlace de la razón social se estira sobre toda la tarjeta y el teléfono y el ⋯ quedan por encima
 * (un enlace no puede ir adentro de otro). `getHref` arma la ruta del detalle. Con `canEdit` cada fila suma su menú ⋯ (Editar y Desactivar / Reactivar), que
 * llama a `onEdit` u `onToggleEstado`; sin edición no hay columna de acciones
 * @param {{
 *   clientes: Cliente[],
 *   getHref: (cliente: Cliente) => string,
 *   canEdit?: boolean,
 *   onEdit?: (cliente: Cliente) => void,
 *   onToggleEstado?: (cliente: Cliente) => void,
 * }} props
 */
export default function ClientesTable({ clientes, getHref, canEdit = false, onEdit, onToggleEstado }) {
  const navigate = useNavigate()

  const onRowClick = (event, cliente) => {
    /*
     * No navegan: los enlaces de la razón social y del teléfono (lo hacen solos), el ⋯ y su menú (que va en un portal, fuera de la fila,
     * pero sus clics igual llegan acá) ni un clic que termina de seleccionar texto de la fila (un CUIT)
     */
    if (!event.currentTarget.contains(event.target) || event.target.closest('a, button')) return
    if (window.getSelection()?.toString()) return
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
                <span className="sr-only">{canEdit ? 'Acciones' : 'Abrir'}</span>
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
                  <td className={`max-w-56 truncate px-3 py-3 ${textSoft[estado]}`}>{dato(cliente.email)}</td>
                  <td className={`px-3 py-3 whitespace-nowrap tabular-nums ${textSoft[estado]}`}>
                    <TelefonoWhatsapp cliente={cliente} className="-my-3 min-h-11" />
                  </td>
                  <td className={`max-w-56 truncate px-3 py-3 ${textSoft[estado]}`}>{dato(cliente.direccion)}</td>
                  <td className="px-3 py-3">
                    <EstadoActivoBadge activo={cliente.activo} />
                  </td>
                  {canEdit ? (
                    <td className="py-2 pr-4">
                      <ClienteActionsMenu cliente={cliente} onEdit={onEdit} onToggleEstado={onToggleEstado} />
                    </td>
                  ) : (
                    <td className={`py-3 pr-4 ${textMuted}`}>
                      <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-black/5 lg:hidden dark:divide-white/10">
        {clientes.map((cliente) => {
          const estado = estadoKey(cliente)
          const email = cliente.email?.trim()
          const direccion = cliente.direccion?.trim()
          return (
            <li key={cliente.id} className={`relative flex items-center gap-3 py-4 pr-2 pl-4 sm:pl-5 ${rowHover}`}>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                  {/* El ::after cubre toda la tarjeta: cualquier toque fuera del teléfono y del ⋯ abre el detalle */}
                  <Link
                    to={getHref(cliente)}
                    className={`truncate font-medium outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-(--focus-ring) ${textStrong[estado]}`}
                  >
                    {cliente.razon_social}
                  </Link>
                  <p className={`text-sm tabular-nums ${textSoft[estado]}`}>
                    <span className={textMuted}>CUIT </span>
                    {dato(cliente.cuit)}
                  </p>
                </div>
                {email && <p className={`truncate text-sm ${textSoft[estado]}`}>{email}</p>}
                {cliente.telefono?.trim() && (
                  <p className={`relative z-10 self-start text-sm ${textSoft[estado]}`}>
                    <TelefonoWhatsapp cliente={cliente} className="-my-3 min-h-11" />
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <EstadoActivoBadge activo={cliente.activo} />
                  {direccion && <span className={`truncate text-sm ${textSoft[estado]}`}>{direccion}</span>}
                </div>
              </div>
              {canEdit ? (
                <div className="relative z-10 shrink-0">
                  <ClienteActionsMenu cliente={cliente} onEdit={onEdit} onToggleEstado={onToggleEstado} />
                </div>
              ) : (
                <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" className={`mr-1 shrink-0 ${textMuted}`} />
              )}
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
