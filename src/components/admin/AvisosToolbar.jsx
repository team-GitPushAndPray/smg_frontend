import { FILTROS_TIPO_AVISO } from '../../utils/avisos'

const chipBase = 'interactive inline-flex min-h-11 items-center rounded-control border px-4 text-sm font-medium'
// Blanco sobre brand-600 pasa AA en ambos modos
const chipActive = 'border-brand-600 bg-brand-600 text-white'
// Sin blur: van sobre el fondo, alcanza con el vidrio opaco
const chipIdle =
  'border-(--glass-border) bg-(--glass-bg-strong) text-neutral-700 hover:border-brand-600/30 hover:text-black dark:text-neutral-300 dark:hover:border-brand-400/30 dark:hover:text-white'

/*
 * Filtro por tipo del centro de avisos (Todos / Service / Certificación), el mismo en las dos pestañas. Se aplica al
 * momento. Son pocas opciones: botones a la vista en vez de un select, que entran en una línea a 360px
 */
export default function AvisosToolbar({ tipo, onTipoChange }) {
  return (
    <div role="group" aria-label="Filtrar por tipo" className="flex flex-wrap gap-2">
      {Object.entries(FILTROS_TIPO_AVISO).map(([valor, { label }]) => {
        const isActive = tipo === valor
        return (
          <button
            key={valor}
            type="button"
            onClick={() => onTipoChange(valor)}
            aria-pressed={isActive}
            className={`${chipBase} ${isActive ? chipActive : chipIdle}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
