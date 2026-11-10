import { FilterX, UserRound } from 'lucide-react'
import { useState } from 'react'
import { esFechaFiltro, getHoyFiltro, TIPOS_CHECKLIST } from '../../utils/historial'
import FilterSelect from './FilterSelect'
import SearchField from './SearchField'

/*
 * Fecha de un extremo del rango, con "Desde" o "Hasta" adentro del campo (un date vacío no dice qué es).
 * Lo escrito se guarda acá y se aplica recién cuando es una fecha completa: al tipear el año, Chrome va mandando
 * "0002-…", "0020-…" y eso no tiene que llegar al back. Borrar la fecha sí se aplica al momento
 */
function DateField({ id, label, value, onChange, min, max }) {
  const [texto, setTexto] = useState(value)
  const [aplicado, setAplicado] = useState(value)

  if (value !== aplicado) {
    setAplicado(value)
    setTexto(value)
  }

  const cambiar = (event) => {
    const valor = event.target.value
    setTexto(valor)
    if (valor === '' || esFechaFiltro(valor)) onChange(valor)
  }

  return (
    <div className="relative min-w-0">
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-sm text-neutral-600 dark:text-neutral-400"
      >
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={texto}
        onChange={cambiar}
        min={min}
        max={max}
        className="field-glass pr-3 pl-16 tabular-nums"
      />
    </div>
  )
}

/*
 * Filtros de los checklists del historial: buscador en las observaciones, responsable, tipo y rango de fechas.
 * `q` y `responsable` son lo escrito en esos campos (se aplican con espera desde la pestaña); tipo y fechas se
 * aplican al momento. Si una fecha deja el rango al revés, la otra se mueve con ella: nunca se pide un rango
 * imposible. "Limpiar filtros" está siempre, deshabilitado sin filtros, para que la pantalla no salte.
 * `children` son acciones sobre el listado filtrado (Exportar PDF), al lado de "Limpiar filtros"
 */
export default function ChecklistsToolbar({ q, responsable, filtros, onFiltrosChange, hasFilters, onClear, children }) {
  const hoy = getHoyFiltro()

  const cambiarDesde = (desde) => {
    const cambios = { desde }
    if (desde && filtros.hasta && desde > filtros.hasta) cambios.hasta = desde
    onFiltrosChange(cambios)
  }

  const cambiarHasta = (hasta) => {
    const cambios = { hasta }
    if (hasta && filtros.desde && hasta < filtros.desde) cambios.desde = hasta
    onFiltrosChange(cambios)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <SearchField
          id="historial-busqueda"
          label="Buscar en las observaciones"
          value={q.texto}
          onChange={q.cambiar}
          onClear={q.borrar}
          placeholder="Buscar en las observaciones"
        />
        <SearchField
          id="historial-responsable"
          label="Filtrar por responsable"
          value={responsable.texto}
          onChange={responsable.cambiar}
          onClear={responsable.borrar}
          placeholder="Responsable"
          icon={UserRound}
          clearLabel="Borrar responsable"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
        <FilterSelect
          id="historial-tipo"
          label="Filtrar por tipo de checklist"
          value={filtros.tipo}
          onChange={(tipo) => onFiltrosChange({ tipo })}
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TIPOS_CHECKLIST).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FilterSelect>
        <DateField
          id="historial-desde"
          label="Desde"
          value={filtros.desde}
          onChange={cambiarDesde}
          max={filtros.hasta || hoy}
        />
        <DateField
          id="historial-hasta"
          label="Hasta"
          value={filtros.hasta}
          onChange={cambiarHasta}
          min={filtros.desde || undefined}
          max={hoy}
        />
        <div className="flex flex-wrap items-center justify-end gap-2 sm:col-span-3 lg:col-span-1">
          <button
            type="button"
            onClick={onClear}
            disabled={!hasFilters}
            className="interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <FilterX size={18} strokeWidth={1.75} aria-hidden="true" />
            Limpiar filtros
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}
