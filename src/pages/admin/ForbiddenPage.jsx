import { Link } from 'react-router'

const DEFAULT_DESCRIPTION = 'Tu rol no incluye este módulo. Si lo necesitás, consultá con un administrador.'

// Sección del panel que el rol del usuario no incluye. Se muestra dentro del panel, con el sidebar a mano
export default function ForbiddenPage({ description = DEFAULT_DESCRIPTION }) {
  return (
    <section className="flex justify-center py-8 sm:py-16">
      <div className="glass flex w-full max-w-sm flex-col items-center gap-4 px-6 py-10 text-center sm:px-8">
        <p className="text-6xl font-semibold tracking-tight text-brand-700 dark:text-brand-400">403</p>
        <h1 className="text-xl font-semibold">No tenés acceso a esta sección</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        <Link to="/admin" className="btn-primary mt-2 w-full">
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}
