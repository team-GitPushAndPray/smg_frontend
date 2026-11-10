import { Construction } from 'lucide-react'

// Contenido provisorio de las páginas del panel hasta que cada módulo tenga su issue.
// `badge` va junto al título y `actions` a la derecha del encabezado (debajo, en celular)
export default function AdminPlaceholder({ title, description, badge, actions }) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
            {badge}
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
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
