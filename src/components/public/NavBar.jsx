import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import ThemeToggle from '../ThemeToggle'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/contacto', label: 'Contacto' },
]

function navLinkClass({ isActive }) {
  const base = 'interactive flex h-11 items-center rounded-control px-4 font-medium'
  return isActive
    ? `${base} bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300`
    : `${base} text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white`
}

export default function NavBar() {
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
    <header className="pointer-events-none sticky top-0 z-40 pt-3 sm:pt-4">
      <div className="page-container">
        <nav aria-label="Principal" className="glass-strong pointer-events-auto">
          {/* Desde tablet, grilla de 3 columnas para que los links queden centrados en la barra */}
          <div className="flex h-16 items-center justify-between gap-4 px-2.5 md:grid md:grid-cols-[1fr_auto_1fr]">
            <Link
              to="/"
              onClick={closeMenu}
              className="interactive flex h-11 items-center gap-3 justify-self-start rounded-control px-2.5"
            >
              <span className="text-lg font-semibold tracking-tight text-brand-700 dark:text-brand-400">SGM</span>
              <span aria-hidden="true" className="hidden h-5 w-px bg-neutral-300 sm:block dark:bg-neutral-700" />
              <span className="hidden text-sm font-medium text-neutral-700 sm:inline dark:text-neutral-300">
                Gestión de Maquinaria
              </span>
            </Link>

            <ul className="hidden items-center gap-1 text-sm md:flex">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end={link.end} className={navLinkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1 justify-self-end">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-expanded={isMenuOpen}
                aria-controls="menu-movil"
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                className="interactive grid size-11 place-items-center rounded-control text-neutral-700 hover:bg-black/5 hover:text-black md:hidden dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {isMenuOpen ? (
                  <X size={22} strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <Menu size={22} strokeWidth={1.75} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <ul id="menu-movil" className="flex flex-col gap-1 border-t border-(--glass-border) p-2.5 md:hidden">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end={link.end} onClick={closeMenu} className={navLinkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>
    </header>
  )
}
