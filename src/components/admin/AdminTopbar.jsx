import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import ThemeToggle from '../ThemeToggle'
import AdminBrand from './AdminBrand'
import AdminNav from './AdminNav'
import UserMenu from './UserMenu'

const iconButton =
  'interactive grid size-11 place-items-center rounded-control text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'

// Barra superior del panel. En celular el sidebar se oculta y su menú se despliega desde acá
export default function AdminTopbar() {
  const { usuario } = useAuth()
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
    <header className="sticky top-3 z-40 sm:top-4">
      {/*
       * El vidrio va en una capa aparte: si el header tuviera backdrop-filter, el menú de usuario
       * (que es hijo suyo y sobresale hacia abajo) no podría desenfocar el contenido que tiene detrás
       */}
      <div aria-hidden="true" className="glass-strong absolute inset-0 -z-10" />
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

        {/* En celular el saludo no entra: el nombre se ve en el menú de usuario */}
        {usuario && (
          <p className="hidden truncate px-3 text-neutral-700 md:block dark:text-neutral-300">
            Hola, <span className="font-semibold text-black dark:text-white">{usuario.nombre}</span>
          </p>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/"
            className="interactive flex h-11 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Ver sitio
            <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <UserMenu />
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
