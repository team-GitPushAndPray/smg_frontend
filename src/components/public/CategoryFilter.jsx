const chipBase = 'interactive inline-flex min-h-11 items-center gap-2 rounded-control border px-4 text-sm font-medium'
// Blanco sobre brand-600 pasa AA en ambos modos
const chipActive = 'border-brand-600 bg-brand-600 text-white'
// Sin blur: son varios y van sobre el fondo, alcanza con el vidrio opaco
const chipIdle =
  'border-(--glass-border) bg-(--glass-bg-strong) text-neutral-700 hover:border-brand-600/30 hover:text-black dark:text-neutral-300 dark:hover:border-brand-400/30 dark:hover:text-white'

function Chip({ label, count, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`${chipBase} ${isActive ? chipActive : chipIdle}`}
    >
      {label}
      <span className={`tabular-nums ${isActive ? '' : 'text-neutral-600 dark:text-neutral-400'}`}>{count}</span>
    </button>
  )
}

// Filtro por tipo de equipo: "Todos" más una opción por categoría, con la cantidad de equipos de cada una
export default function CategoryFilter({ categorias, total, selectedId, onSelect }) {
  return (
    <div role="group" aria-label="Filtrar por tipo" className="flex flex-wrap gap-2">
      <Chip label="Todos" count={total} isActive={selectedId === null} onClick={() => onSelect(null)} />
      {categorias.map((categoria) => (
        <Chip
          key={categoria.id}
          label={categoria.nombre}
          count={categoria.cantidad}
          isActive={selectedId === categoria.id}
          onClick={() => onSelect(categoria.id)}
        />
      ))}
    </div>
  )
}
