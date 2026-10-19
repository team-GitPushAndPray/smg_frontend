import { CircleUserRound, LogOut } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getNombreCompleto, getRolLabel } from '../../utils/usuarios'

const triggerBase =
  'interactive grid size-11 place-items-center rounded-control text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'
const triggerOpen = 'bg-black/5 text-black dark:bg-white/10 dark:text-white'

// Menú de la cuenta en la topbar: nombre, rol y cerrar sesión. El panel siempre tiene sesión (lo protege <RutaPrivada>)
export default function UserMenu() {
  const { usuario, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const menuId = useId()

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

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label="Cuenta de usuario"
        title="Cuenta de usuario"
        className={`${triggerBase} ${isOpen ? triggerOpen : ''}`}
      >
        <CircleUserRound size={22} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {isOpen && (
        <div id={menuId} className="glass-strong absolute top-full right-0 mt-4 flex w-64 flex-col p-2">
          <div className="flex flex-col gap-0.5 px-3 py-2.5">
            <p className="truncate font-medium">{getNombreCompleto(usuario)}</p>
            <p className="truncate text-sm text-neutral-600 dark:text-neutral-400">{getRolLabel(usuario.rol)}</p>
          </div>
          <hr className="my-1 border-neutral-200 dark:border-neutral-800" />
          <button
            type="button"
            onClick={logout}
            className="interactive flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
