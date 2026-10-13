// Aviso del catálogo (error, sin equipos, sin resultados) con una acción opcional.
// `titleAs` cambia el nivel del título (h3 cuando el aviso va dentro de una sección de la home)
export default function CatalogMessage({ icon: Icon, title, description, role, titleAs: Title = 'h2', children }) {
  return (
    <div role={role} className="glass mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-12 text-center">
      <span className="icon-badge">
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <Title className="text-lg font-semibold">{title}</Title>
        <p className="text-pretty text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}
