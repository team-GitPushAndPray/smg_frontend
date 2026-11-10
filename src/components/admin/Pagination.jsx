import { ChevronLeft, ChevronRight } from 'lucide-react'

const ELLIPSIS = '…'
// Con hasta 7 páginas se muestran todas; con más, la primera, la última y las vecinas de la actual
const MAX_VISIBLES = 7

const buttonBase = 'interactive grid size-11 shrink-0 place-items-center rounded-control text-sm font-medium tabular-nums'
const buttonIdle =
  'text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'
// Blanco sobre brand-600 pasa AA en ambos modos
const buttonActive = 'bg-brand-600 text-white'

function getPaginas(page, totalPages) {
  if (totalPages <= MAX_VISIBLES) return Array.from({ length: totalPages }, (_, index) => index + 1)

  // Cerca de un extremo se muestran 4 seguidas, para que la cantidad de botones no salte
  const visibles = new Set([1, totalPages, page - 1, page, page + 1])
  if (page <= 3) [2, 3, 4].forEach((value) => visibles.add(value))
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((value) => visibles.add(value))

  // Un "…" que taparía una sola página se reemplaza por esa página
  const ordenadas = [...visibles].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b)
  return ordenadas.flatMap((value, index) => {
    const salto = index > 0 ? value - ordenadas[index - 1] : 1
    if (salto === 2) return [value - 1, value]
    return salto > 2 ? [ELLIPSIS, value] : [value]
  })
}

/*
 * Paginación de un listado: rango mostrado, total y botones de página. En celular, solo anterior y siguiente.
 * `noun` es el nombre de lo que se lista, en singular y plural ({ one: 'equipo', other: 'equipos' })
 */
export default function Pagination({ page, total, limit, noun, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const desde = total === 0 ? 0 : (page - 1) * limit + 1
  const hasta = Math.min(page * limit, total)

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-neutral-600 tabular-nums dark:text-neutral-400">
        Mostrando {desde}–{hasta} de {total} {total === 1 ? noun.one : noun.other}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Paginación" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
            title="Página anterior"
            className={`${buttonBase} ${buttonIdle}`}
          >
            <ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>

          <p className="px-2 text-sm text-neutral-700 tabular-nums sm:hidden dark:text-neutral-300">
            Página {page} de {totalPages}
          </p>
          <ul className="hidden items-center gap-1 sm:flex">
            {getPaginas(page, totalPages).map((value, index) =>
              value === ELLIPSIS ? (
                <li key={`gap-${index}`} aria-hidden="true" className="grid w-6 place-items-center text-neutral-500 dark:text-neutral-400">
                  {ELLIPSIS}
                </li>
              ) : (
                <li key={value}>
                  <button
                    type="button"
                    onClick={() => onPageChange(value)}
                    aria-label={`Página ${value}`}
                    aria-current={value === page ? 'page' : undefined}
                    className={`${buttonBase} ${value === page ? buttonActive : buttonIdle}`}
                  >
                    {value}
                  </button>
                </li>
              ),
            )}
          </ul>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Página siguiente"
            title="Página siguiente"
            className={`${buttonBase} ${buttonIdle}`}
          >
            <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  )
}
