import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

// Nombre de cada filtro en la URL (/admin/alquileres/clientes?buscar=limay&estado=todos)
const PARAMS = Object.freeze({
  q: 'buscar',
  estado: 'estado',
})

/*
 * Filtro de estado: `activo` es lo que viaja a GET /clientes (sin él, el back trae todos). No hay "Inactivos":
 * los inactivos se ven en "Todos"
 */
export const ESTADOS_FILTRO_CLIENTES = Object.freeze({
  activos: { label: 'Activos', activo: true },
  todos: { label: 'Todos', activo: undefined },
})

// El que se ve al entrar: no se escribe en la URL
const ESTADO_POR_DEFECTO = 'activos'

/*
 * Búsqueda y filtro de estado de los clientes guardados en la URL: sobreviven a recargar y a volver desde el detalle.
 * Un estado que no existe se ignora (queda Activos). `setFiltros` recibe solo los que cambian; `limpiarFiltros` vuelve
 * a Activos sin búsqueda. Se reemplaza la entrada del historial: "atrás" lleva a la pantalla anterior, no al filtro anterior
 */
export function useFiltrosClientes() {
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get(PARAMS.q)?.trim() ?? ''
  const estadoParam = searchParams.get(PARAMS.estado)
  const estado = Object.hasOwn(ESTADOS_FILTRO_CLIENTES, estadoParam) ? estadoParam : ESTADO_POR_DEFECTO

  const filtros = useMemo(() => ({ q, estado }), [q, estado])

  // Los valores vacíos (y el estado por defecto) no se escriben: la URL queda lo más corta posible
  const setFiltros = useCallback(
    (cambios) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [clave, valor] of Object.entries(cambios)) {
            const vacio = valor === '' || (clave === 'estado' && valor === ESTADO_POR_DEFECTO)
            if (vacio) next.delete(PARAMS[clave])
            else next.set(PARAMS[clave], valor)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const limpiarFiltros = useCallback(() => setFiltros({ q: '', estado: ESTADO_POR_DEFECTO }), [setFiltros])

  return { filtros, setFiltros, limpiarFiltros }
}
