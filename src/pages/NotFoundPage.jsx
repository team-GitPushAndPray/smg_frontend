import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <section className="glass flex w-full max-w-sm flex-col items-center gap-4 px-6 py-10 text-center sm:px-8">
        <p className="text-6xl font-semibold tracking-tight text-brand-700 dark:text-brand-400">404</p>
        <h1 className="text-xl font-semibold">Página no encontrada</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">La página que buscás no existe.</p>
        <Link to="/" className="btn-primary mt-2 w-full">
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}
