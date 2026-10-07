import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl font-bold text-brand-600 dark:text-brand-500">404</p>
      <p className="text-neutral-600 dark:text-neutral-400">La página que buscás no existe.</p>
      <Link
        to="/"
        className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
      >
        Volver al inicio
      </Link>
    </section>
  )
}
