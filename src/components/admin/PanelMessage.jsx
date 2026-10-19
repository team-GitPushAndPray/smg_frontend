// Aviso dentro de una sección del panel (error de carga, sin datos, sin resultados) con una acción opcional
export default function PanelMessage({ icon: Icon, title, description, role, children }) {
  return (
    <div role={role} className="glass flex flex-col items-center gap-4 px-6 py-12 text-center sm:py-16">
      <span className="icon-badge">
        <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-pretty text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}
