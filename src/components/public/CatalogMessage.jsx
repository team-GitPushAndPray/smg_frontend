// Aviso del catálogo (error, sin equipos, sin resultados) con una acción opcional
export default function CatalogMessage({ icon: Icon, title, description, role, children }) {
  return (
    <div role={role} className="glass mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-12 text-center">
      <span className="icon-badge">
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-pretty text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}
