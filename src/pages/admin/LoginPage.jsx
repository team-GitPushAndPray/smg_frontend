import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router'
import ThemeToggle from '../../components/ThemeToggle'

// Pantalla completa, sin layout. El inicio de sesión real llega en F-05
export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col p-3 sm:p-4">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <main className="flex flex-1 items-center justify-center py-8">
        <section className="glass flex w-full max-w-sm flex-col items-center gap-6 px-6 py-10 text-center sm:px-8">
          <span className="icon-badge">
            <LockKeyhole size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold tracking-tight text-brand-700 dark:text-brand-400">SGM</p>
            <h1 className="text-2xl font-semibold">Acceso administración</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              El inicio de sesión del panel de gestión estará disponible próximamente.
            </p>
          </div>

          <Link to="/" className="btn-tonal w-full">
            <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
            Volver al sitio
          </Link>
        </section>
      </main>
    </div>
  )
}
