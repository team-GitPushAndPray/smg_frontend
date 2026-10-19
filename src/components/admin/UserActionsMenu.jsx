import { Ellipsis, LoaderCircle, PencilLine, UserCheck, UserX } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { getNombreCompleto } from '../../utils/usuarios'

const itemBase = 'interactive flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-medium'
const itemIdle =
  'text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'
const itemDanger =
  'text-brand-700 hover:bg-brand-600/10 dark:text-brand-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-300'

/*
 * Menú ⋯ de una fila de usuarios: Editar y Dar de baja / Reactivar.
 * `canDeactivate` en false oculta "Dar de baja" (el usuario logueado sobre sí mismo).
 * Con `isPending` (cambiando el estado) el botón muestra la carga y no se puede abrir
 */
export default function UserActionsMenu({ usuario, canDeactivate, isPending, onEdit, onToggleEstado }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const menuId = useId()
  const nombre = getNombreCompleto(usuario)
  const showEstado = !usuario.activo || canDeactivate

  // Se cierra con Escape (devolviendo el foco al botón) o con un clic fuera del menú
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      buttonRef.current?.focus()
    }
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [isOpen])

  // El foco vuelve al ⋯ antes de abrir el modal: así, al cerrarlo, regresa a esta fila
  const choose = (action) => {
    setIsOpen(false)
    buttonRef.current?.focus()
    action(usuario)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        disabled={isPending}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`Acciones de ${nombre}`}
        title="Acciones"
        className={`interactive grid size-11 place-items-center rounded-control text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white ${isOpen ? 'bg-black/5 text-black dark:bg-white/10 dark:text-white' : ''}`}
      >
        {isPending ? (
          <LoaderCircle size={20} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />
        ) : (
          <Ellipsis size={20} strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>

      {/* z-20: sobre las filas que le siguen, que también tienen su ⋯ posicionado */}
      {isOpen && (
        <div id={menuId} className="glass-strong absolute top-full right-0 z-20 mt-2 flex w-52 flex-col p-1.5">
          <button type="button" onClick={() => choose(onEdit)} className={`${itemBase} ${itemIdle}`}>
            <PencilLine size={18} strokeWidth={1.75} aria-hidden="true" />
            Editar
          </button>
          {showEstado && (
            <button
              type="button"
              onClick={() => choose(onToggleEstado)}
              className={`${itemBase} ${usuario.activo ? itemDanger : itemIdle}`}
            >
              {usuario.activo ? (
                <UserX size={18} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <UserCheck size={18} strokeWidth={1.75} aria-hidden="true" />
              )}
              {usuario.activo ? 'Dar de baja' : 'Reactivar'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
