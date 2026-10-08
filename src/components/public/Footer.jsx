import { LockKeyhole } from 'lucide-react'
import { Link } from 'react-router'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="page-container pt-16 pb-4 sm:pb-6">
      <div className="glass flex flex-col gap-6 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-8">
        <div className="flex flex-col gap-1">
          <p className="font-semibold tracking-tight">
            <span className="text-brand-700 dark:text-brand-400">SGM</span> · Sistema Integral de Gestión de Maquinaria
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Alquiler, venta y mantenimiento de maquinaria pesada.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 text-xs text-neutral-600 sm:flex-col sm:items-end sm:gap-1 dark:text-neutral-400">
          <p>© {year} SGM</p>
          {/* Acceso discreto al login del dashboard */}
          <Link
            to="/admin/login"
            className="interactive -mx-2 inline-flex min-h-11 items-center gap-1.5 rounded-control px-2 hover:text-black sm:-mb-3 dark:hover:text-white"
          >
            <LockKeyhole size={14} strokeWidth={1.75} aria-hidden="true" />
            Acceso administración
          </Link>
        </div>
      </div>
    </footer>
  )
}
