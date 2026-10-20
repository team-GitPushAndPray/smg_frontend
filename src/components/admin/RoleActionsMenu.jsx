import { Ellipsis, LoaderCircle, PencilLine, ShieldCheck, ShieldOff } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getRolLabel } from '../../utils/usuarios'

const itemBase = 'interactive flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-medium'
const itemIdle =
  'text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'
const itemDanger =
  'text-brand-700 hover:bg-brand-600/10 dark:text-brand-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-300'

// Separación entre el botón y el menú, y margen mínimo con el borde de la pantalla
const GAP = 8

// Debajo del botón, alineado a su borde izquierdo; si no entra abajo, se abre hacia arriba
function getPosition(button, menu) {
  const rect = button.getBoundingClientRect()
  const { width, height } = menu.getBoundingClientRect()
  const left = Math.max(GAP, Math.min(rect.left, window.innerWidth - width - GAP))
  const fitsBelow = rect.bottom + GAP + height <= window.innerHeight - GAP
  return { left, top: fitsBelow ? rect.bottom + GAP : Math.max(GAP, rect.top - GAP - height) }
}

/*
 * Menú ⋯ de una fila de la matriz de permisos: Editar y Desactivar / Activar.
 * Va en un portal a <body> con posición fija: la matriz tiene scroll horizontal y recortaría un menú desplegado adentro.
 * Se cierra con Escape, Tab, un clic afuera o cualquier scroll (así nunca queda separado de su botón).
 * Con `isPending` (cambiando el estado) el botón muestra la carga y no se puede abrir
 */
export default function RoleActionsMenu({ rol, isPending, onEdit, onToggleEstado }) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const menuId = useId()
  const nombre = getRolLabel(rol)

  // Se ubica antes de pintar (así no aparece un instante en otro lugar) y el foco pasa a la primera opción
  useLayoutEffect(() => {
    if (!isOpen) return
    const menu = menuRef.current
    const { top, left } = getPosition(buttonRef.current, menu)
    menu.style.top = `${top}px`
    menu.style.left = `${left}px`
    menu.querySelector('button')?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const close = () => setIsOpen(false)
    const onKeyDown = (event) => {
      if (event.key !== 'Escape' && event.key !== 'Tab') return
      event.preventDefault()
      close()
      buttonRef.current?.focus()
    }
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) close()
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [isOpen])

  // El foco vuelve al ⋯ antes de abrir el modal: así, al cerrarlo, regresa a esta fila
  const choose = (action) => {
    setIsOpen(false)
    buttonRef.current?.focus()
    action(rol)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        disabled={isPending}
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={`Acciones del rol ${nombre}`}
        title="Acciones"
        className={`interactive grid size-11 shrink-0 place-items-center rounded-control text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white ${isOpen ? 'bg-black/5 text-black dark:bg-white/10 dark:text-white' : ''}`}
      >
        {isPending ? (
          <LoaderCircle size={20} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />
        ) : (
          <Ellipsis size={20} strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>

      {/* z-30: sobre el contenido del panel y debajo de la topbar (z-40), los modales (z-50) y los avisos (z-60) */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            className="glass-strong fixed z-30 flex w-52 flex-col p-1.5"
          >
            <button type="button" onClick={() => choose(onEdit)} className={`${itemBase} ${itemIdle}`}>
              <PencilLine size={18} strokeWidth={1.75} aria-hidden="true" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => choose(onToggleEstado)}
              className={`${itemBase} ${rol.activo ? itemDanger : itemIdle}`}
            >
              {rol.activo ? (
                <ShieldOff size={18} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />
              )}
              {rol.activo ? 'Desactivar' : 'Activar'}
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}
