import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { useActiveSection } from '../../hooks/useActiveSection'
import ThemeToggle from '../ThemeToggle'

// Secciones de la home a las que se navega por ancla
const sections = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'ubicacion', label: 'Ubicación' },
  { id: 'contacto', label: 'Contacto' },
]
const sectionIds = sections.map((section) => section.id)

const linkBase = 'interactive flex h-11 items-center rounded-control px-4 font-medium'
const linkActive = 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
const linkIdle =
  'text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'

// Catálogo es otra página: se distingue de las anclas con un borde del acento
function catalogLinkClass({ isActive }) {
  const base = `${linkBase} border border-brand-600/30 text-brand-700 dark:border-brand-400/30 dark:text-brand-400`
  return isActive
    ? `${base} bg-brand-600/10 dark:bg-brand-500/15`
    : `${base} hover:bg-brand-600/10 dark:hover:bg-brand-500/15`
}

function SectionLinks({ activeId, onNavigate }) {
  return sections.map((section) => {
    const isActive = section.id === activeId
    return (
      <li key={section.id}>
        <Link
          to={{ pathname: '/', hash: section.id }}
          onClick={onNavigate}
          aria-current={isActive ? 'location' : undefined}
          className={`${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          {section.label}
        </Link>
      </li>
    )
  })
}

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const activeId = useActiveSection(sectionIds)
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
          {/* Desde tablet, grilla de 3 columnas para que las anclas queden centradas en la barra */}
          <div className="flex h-16 items-center justify-between gap-4 px-2.5 md:grid md:grid-cols-[1fr_auto_1fr]">
            <Link
              to={{ pathname: '/', hash: 'inicio' }}
              onClick={closeMenu}
              className="interactive flex h-11 items-center gap-3 justify-self-start rounded-control px-2.5"
            >
              <span className="text-lg font-semibold tracking-tight text-brand-700 dark:text-brand-400">SGM</span>
              {/* En tablet se oculta el subtítulo para dejarle lugar a las anclas */}
              <span
                aria-hidden="true"
                className="hidden h-5 w-px bg-neutral-300 sm:block md:hidden lg:block dark:bg-neutral-700"
              />
              <span className="hidden text-sm font-medium text-neutral-700 sm:inline md:hidden lg:inline dark:text-neutral-300">
                Gestión de Maquinaria
              </span>
            </Link>

            <ul className="hidden items-center gap-1 text-sm md:flex">
              <SectionLinks activeId={activeId} />
            </ul>

            <div className="flex items-center gap-1 justify-self-end">
              <div className="mr-1 hidden text-sm md:block">
                <NavLink to="/catalogo" className={catalogLinkClass}>
                  Catálogo
                </NavLink>
              </div>
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
              <SectionLinks activeId={activeId} onNavigate={closeMenu} />
              <li className="mt-1">
                <NavLink to="/catalogo" onClick={closeMenu} className={catalogLinkClass}>
                  Catálogo
                </NavLink>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  )
}
