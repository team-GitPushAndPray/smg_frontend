import { CircleAlert, CloudOff, Info, RotateCw, Search, X } from 'lucide-react'
import { useId, useState } from 'react'
import { filtrarEquipos } from '../../utils/alquileres'

const textMuted = 'text-neutral-600 dark:text-neutral-400'
const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'

const GRUPOS = [
  { tipo: 'maquina', titulo: 'Máquinas', vacio: 'No hay máquinas disponibles.', sinCoincidencias: 'Ninguna máquina coincide' },
  {
    tipo: 'aditamento',
    titulo: 'Aditamentos',
    vacio: 'No hay aditamentos disponibles.',
    sinCoincidencias: 'Ningún aditamento coincide',
  },
]

// Marca y modelo de una máquina ("Caterpillar 320D"); de un aditamento, solo la marca
function descripcionEquipo(equipo) {
  return [equipo.marca, equipo.modelo].filter(Boolean).join(' ')
}

/**
 * Selección múltiple de los equipos de un alquiler, sobre la lista de disponibles (useEquiposAlquilables). Buscador por
 * código interno o categoría y dos grupos, Máquinas y Aditamentos, con una casilla por equipo. Los elegidos se ven
 * arriba como chips; cada chip es un botón que lo quita. `seleccionados` guarda los equipos completos, así los chips
 * se siguen viendo aunque la lista se recargue.
 * Va dentro de una superficie .glass: los campos usan `field` y la lista un fondo tintado, sin otra capa de vidrio.
 * `sinPermiso`: el rol no tiene Máquinas (GET /equipos lo exige), así que no hay lista y se explica por qué.
 * `aviso`: equipos que el back rechazó por no estar más disponibles (ya sacados de la selección), con `onCerrarAviso`
 * @param {{
 *   equipos: object[],
 *   status: 'loading' | 'success' | 'error',
 *   isLoading: boolean,
 *   hasData: boolean,
 *   onRetry: () => void,
 *   seleccionados: object[],
 *   onChange: (seleccionados: object[]) => void,
 *   error?: string,
 *   sinPermiso?: boolean,
 *   aviso?: { codigos: string[], mensaje: string } | null,
 *   onCerrarAviso?: () => void,
 * }} props
 */
export default function EquiposSelector({
  equipos,
  status,
  isLoading,
  hasData,
  onRetry,
  seleccionados,
  onChange,
  error,
  sinPermiso = false,
  aviso = null,
  onCerrarAviso,
}) {
  const id = useId()
  const [busqueda, setBusqueda] = useState('')
  const idsElegidos = new Set(seleccionados.map((equipo) => equipo.id))
  const filtrados = filtrarEquipos(equipos, busqueda)
  const errorId = `${id}-error`

  const alternar = (equipo) => {
    onChange(
      idsElegidos.has(equipo.id)
        ? seleccionados.filter((elegido) => elegido.id !== equipo.id)
        : [...seleccionados, equipo],
    )
  }

  const quitar = (equipo) => onChange(seleccionados.filter((elegido) => elegido.id !== equipo.id))

  if (sinPermiso) {
    return (
      <p className="flex items-start gap-2.5 rounded-control bg-black/5 px-3.5 py-3 text-sm text-neutral-800 dark:bg-white/10 dark:text-neutral-200">
        <Info size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
        <span>
          Tu rol no tiene acceso a <strong className="font-medium">Máquinas</strong>, que es de donde salen los equipos
          disponibles. Pedile a un administrador que te lo habilite para poder cargar alquileres.
        </span>
      </p>
    )
  }

  let lista
  if (status === 'loading' && !hasData) {
    lista = <ListaSkeleton />
  } else if (status === 'error' && !hasData) {
    lista = (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-control bg-black/5 px-4 py-4 dark:bg-white/5">
        <p className="flex items-start gap-2.5 text-sm text-neutral-800 dark:text-neutral-200">
          <CloudOff size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
          No pudimos cargar los equipos disponibles. Revisá tu conexión e intentá de nuevo.
        </p>
        <button type="button" onClick={onRetry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    )
  } else if (equipos.length === 0) {
    lista = (
      <p className={`rounded-control bg-black/5 px-4 py-4 text-sm dark:bg-white/5 ${textMuted}`}>
        No hay equipos disponibles para alquilar en este momento.
      </p>
    )
  } else {
    lista = (
      // Mientras se recarga se sigue viendo la lista anterior, atenuada
      <div
        aria-busy={isLoading}
        className={`grid gap-4 transition-opacity duration-200 ease-glass lg:grid-cols-2 ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {GRUPOS.map((grupo) => (
          <GrupoEquipos
            key={grupo.tipo}
            grupo={grupo}
            todos={equipos.filter((equipo) => equipo.tipo === grupo.tipo)}
            filtrados={filtrados.filter((equipo) => equipo.tipo === grupo.tipo)}
            busqueda={busqueda.trim()}
            idsElegidos={idsElegidos}
            onAlternar={alternar}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {aviso && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-control bg-brand-600/10 py-3 pr-1.5 pl-3.5 text-sm text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
        >
          <CircleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-3 shrink-0" />
          <div className="flex flex-1 flex-col gap-1 py-2.5">
            {aviso.codigos.length > 0 ? <TextoNoDisponibles codigos={aviso.codigos} /> : <p>{aviso.mensaje}</p>}
          </div>
          {onCerrarAviso && (
            <button
              type="button"
              onClick={onCerrarAviso}
              aria-label="Cerrar aviso"
              title="Cerrar aviso"
              className="interactive grid size-11 shrink-0 place-items-center rounded-control hover:bg-brand-600/10 dark:hover:bg-brand-500/15"
            >
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium" id={`${id}-elegidos`}>
          {seleccionados.length === 0
            ? 'Todavía no elegiste equipos'
            : `${seleccionados.length === 1 ? '1 equipo elegido' : `${seleccionados.length} equipos elegidos`}`}
        </p>
        {seleccionados.length > 0 && (
          <ul aria-labelledby={`${id}-elegidos`} className="flex flex-wrap gap-2">
            {seleccionados.map((equipo) => (
              <li key={equipo.id}>
                <button
                  type="button"
                  onClick={() => quitar(equipo)}
                  aria-label={`Quitar ${equipo.codigoInterno}`}
                  title={`Quitar ${equipo.codigoInterno}`}
                  className="interactive inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-600/10 pr-3 pl-4 text-sm font-medium text-brand-700 hover:bg-brand-600/15 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25"
                >
                  <span className="tabular-nums">{equipo.codigoInterno}</span>
                  <X size={16} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p id={errorId} className="text-sm text-brand-700 dark:text-brand-400">
            {error}
          </p>
        )}
      </div>

      {(hasData || status === 'success') && equipos.length > 0 && (
        <div className="relative">
          <label htmlFor={`${id}-buscar`} className="sr-only">
            Buscar equipos por código o categoría
          </label>
          <Search size={18} strokeWidth={1.75} aria-hidden="true" className="field-icon left-3.5" />
          <input
            id={`${id}-buscar`}
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por código o categoría"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            // Enter en el buscador no tiene que enviar el formulario
            onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? errorId : undefined}
            className="field pr-11 pl-11 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              aria-label="Borrar búsqueda"
              title="Borrar búsqueda"
              className="interactive absolute inset-y-0 right-0 grid w-11 place-items-center rounded-control text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
            >
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {lista}

      {status === 'error' && hasData && (
        <p role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-700 dark:text-neutral-300">
          No pudimos actualizar la lista: puede haber equipos que ya no estén disponibles.
          <button type="button" onClick={onRetry} className="btn-tonal min-h-9 px-3 text-sm">
            <RotateCw size={16} strokeWidth={1.75} aria-hidden="true" />
            Reintentar
          </button>
        </p>
      )}
    </div>
  )
}

// Qué equipos rechazó el back y qué se hizo con ellos
function TextoNoDisponibles({ codigos }) {
  if (codigos.length === 1) {
    return (
      <>
        <p className="font-medium">{codigos[0]} ya no está disponible.</p>
        <p>
          Cambió de estado mientras cargabas (por ejemplo, otra persona lo alquiló). Lo sacamos de la selección y la
          lista se actualizó: elegí otro o confirmá sin él.
        </p>
      </>
    )
  }
  return (
    <>
      <p className="font-medium">{codigos.join(', ')} ya no están disponibles.</p>
      <p>
        Cambiaron de estado mientras cargabas (por ejemplo, otra persona los alquiló). Los sacamos de la selección y la
        lista se actualizó: elegí otros o confirmá sin ellos.
      </p>
    </>
  )
}

function GrupoEquipos({ grupo, todos, filtrados, busqueda, idsElegidos, onAlternar }) {
  const tituloId = useId()
  const elegidosDelGrupo = todos.filter((equipo) => idsElegidos.has(equipo.id)).length

  let contenido
  if (todos.length === 0) {
    contenido = <p className={`px-3 py-3 text-sm ${textMuted}`}>{grupo.vacio}</p>
  } else if (filtrados.length === 0) {
    contenido = (
      <p className={`px-3 py-3 text-sm ${textMuted}`}>
        {grupo.sinCoincidencias} con «{busqueda}».
      </p>
    )
  } else {
    contenido = (
      <ul className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
        {filtrados.map((equipo) => {
          const elegido = idsElegidos.has(equipo.id)
          const descripcion = descripcionEquipo(equipo)
          return (
            <li key={equipo.id}>
              <label
                className={`interactive flex min-h-12 cursor-pointer items-center gap-3 rounded-control px-3 py-2 ${
                  elegido
                    ? 'bg-brand-600/10 dark:bg-brand-500/15'
                    : 'hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={elegido}
                  onChange={() => onAlternar(equipo)}
                  className="size-4.5 shrink-0 cursor-pointer accent-brand-600 dark:accent-brand-500"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium text-black tabular-nums dark:text-white">
                    {equipo.codigoInterno}
                  </span>
                  <span className={`truncate text-sm ${textMuted}`}>
                    {[equipo.categoria?.nombre, descripcion].filter(Boolean).join(' · ') || '—'}
                  </span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <fieldset aria-labelledby={tituloId} className="flex min-w-0 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h3 id={tituloId} className="text-sm font-semibold">
          {grupo.titulo}
        </h3>
        <span className={`text-sm tabular-nums ${textMuted}`}>
          {elegidosDelGrupo > 0 ? `${elegidosDelGrupo} de ${todos.length}` : todos.length}
          <span className="sr-only"> {elegidosDelGrupo > 0 ? 'elegidos' : 'disponibles'}</span>
        </span>
      </div>
      <div className="rounded-control bg-black/5 p-1.5 dark:bg-white/5">{contenido}</div>
    </fieldset>
  )
}

function ListaSkeleton() {
  return (
    <>
      <p role="status" className="sr-only">
        Cargando equipos disponibles…
      </p>
      <div aria-hidden="true" className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((grupo) => (
          <div key={grupo} className="flex flex-col gap-2">
            <span className={`h-5 w-28 ${skeletonBar}`} />
            <div className="flex flex-col gap-1.5 rounded-control bg-black/5 p-1.5 dark:bg-white/5">
              {[0, 1, 2].map((fila) => (
                <span key={fila} className={`h-12 ${skeletonBar}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
