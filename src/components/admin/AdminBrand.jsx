import { Link } from 'react-router'

// Marca del panel: lleva al inicio del panel de gestión
export default function AdminBrand({ onNavigate }) {
  return (
    <Link
      to="/admin"
      onClick={onNavigate}
      className="interactive flex h-11 items-center gap-3 rounded-control px-2.5"
    >
      <span className="text-lg font-semibold tracking-tight text-brand-700 dark:text-brand-400">SGM</span>
      {/* En celulares chicos el subtítulo no entra junto a las acciones de la topbar */}
      <span aria-hidden="true" className="hidden h-5 w-px bg-neutral-300 sm:block dark:bg-neutral-700" />
      <span className="hidden text-sm font-medium text-neutral-700 sm:inline dark:text-neutral-300">
        Panel de gestión
      </span>
    </Link>
  )
}
