import { ArrowUpRight, CircleUserRound, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import ThemeToggle from '../ThemeToggle'
import AdminBrand from './AdminBrand'
import AdminNav from './AdminNav'

const iconButton =
  'interactive grid size-11 place-items-center rounded-control text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'

// Barra superior del panel. En celular el sidebar se oculta y su menú se despliega desde acá
export default function AdminTopbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

  // El menú de celular se cierra con Escape
  useEffect(() => {
    if (!isMenuOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  return (
    <header className="glass-strong sticky top-3 z-40 sm:top-4">
      <div className="flex h-16 items-center justify-between gap-2 px-2.5">
        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="menu-panel-movil"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className={iconButton}
          >
            {isMenuOpen ? (
              <X size={22} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Menu size={22} strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
          <AdminBrand onNavigate={closeMenu} />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/"
            className="interactive flex h-11 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Ver sitio
            <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <ThemeToggle />
          {/* El menú de usuario (perfil, cerrar sesión) se completa en otra issue */}
          <button type="button" aria-label="Cuenta de usuario" title="Cuenta de usuario" className={iconButton}>
            <CircleUserRound size={22} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="menu-panel-movil"
          aria-label="Panel de gestión"
          className="border-t border-(--glass-border) p-2.5 md:hidden"
        >
          <AdminNav onNavigate={closeMenu} />
        </nav>
      )}
    </header>
  )
}
