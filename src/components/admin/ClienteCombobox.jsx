import { Building2, Check, ChevronDown, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { normalizeText } from '../../utils/text'

/** @import { Cliente } from '../../types/alquileres' */

const optionBase = 'flex min-h-11 cursor-pointer items-center gap-3 rounded-control px-3 text-sm'
const optionIdle = 'text-neutral-800 dark:text-neutral-200'
const optionActive = 'bg-black/5 text-black dark:bg-white/10 dark:text-white'
const textMuted = 'text-neutral-600 dark:text-neutral-400'

// Texto de una opción "vacía" (sin filtro de cliente) y del campo cuando no hay ninguno elegido
const TODOS = 'Todos los clientes'

// Campo sin opción vacía (en un formulario) cuando todavía no se eligió ninguno
const ELEGIR = 'Elegí un cliente'

/**
 * Select con búsqueda de un cliente (patrón combobox de WAI-ARIA con lista): se escribe para filtrar por razón social
 * sin importar mayúsculas ni tildes; las flechas recorren la lista, Enter elige y Escape cierra. La ✕ lo vacía.
 * `value` es el id elegido o null; `onChange` recibe el nuevo id o null. Los inactivos que vengan en `clientes` se
 * listan marcados (el filtro del Historial los incluye porque pueden tener alquileres viejos).
 *
 * Para filtrar (por defecto): la primera opción, `opcionTodos` ("Todos los clientes"), quita el filtro; va sobre el
 * fondo de la página (vidrio opaco, como FilterSelect) con su label solo para lectores de pantalla.
 * En un formulario (`enFormulario`): sin opción vacía (`opcionTodos={null}`), va dentro de una superficie .glass con
 * el estilo `field` y el label lo pone el Field que lo envuelve; `invalid` y `describedBy` vienen de ese Field.
 * La lista flota encima con glass-strong. Mientras los clientes cargan o si fallan, queda deshabilitado con el motivo
 * en el campo
 * @param {{
 *   id: string,
 *   label: string,
 *   clientes: Cliente[],
 *   status: 'loading' | 'success' | 'error',
 *   value: number | null,
 *   onChange: (id: number | null) => void,
 *   opcionTodos?: string | null,
 *   enFormulario?: boolean,
 *   invalid?: boolean,
 *   describedBy?: string,
 *   disabled?: boolean,
 * }} props
 */
export default function ClienteCombobox({
  id,
  label,
  clientes,
  status,
  value,
  onChange,
  opcionTodos = TODOS,
  enFormulario = false,
  invalid = false,
  describedBy,
  disabled: deshabilitado = false,
}) {
  const listboxId = useId()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const disabled = deshabilitado || status !== 'success'
  const seleccionado = value ? clientes.find((cliente) => cliente.id === value) : null
  // Un cliente de la URL que no está en la lista (un enlace viejo) se muestra por su número
  const textoSeleccionado = seleccionado?.razon_social ?? (value && status === 'success' ? `Cliente N.º ${value}` : '')

  const busqueda = normalizeText(query)
  const filtrados = busqueda
    ? clientes.filter((cliente) => normalizeText(cliente.razon_social).includes(busqueda))
    : clientes
  // La opción 0 es "Todos los clientes" (si la hay); solo se ofrece sin búsqueda
  const opciones = busqueda || !opcionTodos ? filtrados : [null, ...filtrados]

  const placeholder = {
    loading: 'Cargando clientes…',
    error: 'Clientes no disponibles',
    success: opcionTodos ?? ELEGIR,
  }[status]
  const quitarLabel = opcionTodos ? 'Quitar filtro de cliente' : 'Quitar cliente elegido'

  const abrir = () => {
    if (disabled || isOpen) return
    setQuery('')
    setActiveIndex(Math.max(0, opciones.findIndex((cliente) => (cliente?.id ?? null) === value)))
    setIsOpen(true)
  }

  const cerrar = () => {
    setIsOpen(false)
    setQuery('')
  }

  const elegir = (cliente) => {
    cerrar()
    const nuevo = cliente?.id ?? null
    if (nuevo !== value) onChange(nuevo)
  }

  const mover = (index) => {
    setActiveIndex(index)
    listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: 'nearest' })
  }

  const onKeyDown = (event) => {
    const ultima = opciones.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) abrir()
        else mover(Math.min(activeIndex + 1, ultima))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (isOpen) mover(Math.max(activeIndex - 1, 0))
        break
      case 'Home':
      case 'End':
        if (!isOpen || opciones.length === 0) return
        event.preventDefault()
        mover(event.key === 'Home' ? 0 : ultima)
        break
      case 'Enter':
        if (!isOpen) return
        event.preventDefault()
        if (opciones.length > 0) elegir(opciones[Math.min(activeIndex, ultima)])
        break
      case 'Escape':
        if (!isOpen) return
        event.preventDefault()
        cerrar()
        break
      default:
        break
    }
  }

  const activeId = isOpen && opciones.length > 0 ? `${listboxId}-${Math.min(activeIndex, opciones.length - 1)}` : undefined

  return (
    <div className="relative min-w-0">
      {!enFormulario && (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      )}
      <Building2 size={18} strokeWidth={1.75} aria-hidden="true" className="field-icon left-4" />
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        value={isOpen ? query : textoSeleccionado}
        placeholder={isOpen && textoSeleccionado ? textoSeleccionado : placeholder}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(0)
          if (!isOpen) setIsOpen(true)
        }}
        onClick={abrir}
        onBlur={cerrar}
        onKeyDown={onKeyDown}
        className={`${enFormulario ? 'field' : 'field-glass'} truncate pr-20 pl-11 disabled:opacity-60`}
      />

      <div className="absolute inset-y-0 right-0 z-10 flex items-center">
        {value && !disabled && (
          <button
            type="button"
            onClick={() => {
              cerrar()
              onChange(null)
              inputRef.current?.focus()
            }}
            // Sin esto el campo pierde el foco antes del clic y la lista se cierra y se vuelve a abrir
            onMouseDown={(event) => event.preventDefault()}
            aria-label={quitarLabel}
            title={quitarLabel}
            className="interactive grid size-11 place-items-center rounded-control text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
        <ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" className={`pointer-events-none mr-3.5 ${textMuted}`} />
      </div>

      {/* z-30: sobre el contenido del panel y debajo de la topbar (z-40), los modales (z-50) y los avisos (z-60) */}
      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label={label}
        hidden={!isOpen}
        // Elegir con el mouse no le saca el foco al campo (así no se cierra antes del clic)
        onMouseDown={(event) => event.preventDefault()}
        className="glass-strong absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto p-1.5"
      >
        {opciones.length === 0 ? (
          <li role="presentation" className={`px-3 py-3 text-sm ${textMuted}`}>
            Ningún cliente coincide con «{query.trim()}»
          </li>
        ) : (
          opciones.map((cliente, index) => {
            const isSelected = (cliente?.id ?? null) === value
            const isActive = index === activeIndex
            return (
              <li
                key={cliente?.id ?? 'todos'}
                id={`${listboxId}-${index}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                onClick={() => elegir(cliente)}
                onMouseMove={() => activeIndex !== index && setActiveIndex(index)}
                className={`${optionBase} ${isActive ? optionActive : optionIdle}`}
              >
                <span className="min-w-0 flex-1 truncate">{cliente ? cliente.razon_social : opcionTodos}</span>
                {cliente && !cliente.activo && <span className={`shrink-0 text-xs ${textMuted}`}>Inactivo</span>}
                <Check
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className={`shrink-0 text-brand-700 dark:text-brand-400 ${isSelected ? '' : 'invisible'}`}
                />
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
