import { Construction } from 'lucide-react'

// Contenido provisorio de las páginas del panel hasta que cada módulo tenga su issue
export default function AdminPlaceholder({ title, description }) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
      </header>

      <div className="glass flex flex-col items-center gap-3 px-6 py-12 text-center sm:py-16">
        <span className="icon-badge">
          <Construction size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <p className="font-medium">En construcción</p>
        <p className="max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
          Esta sección todavía no tiene contenido. Se completa en una próxima etapa.
        </p>
      </div>
    </section>
  )
}
