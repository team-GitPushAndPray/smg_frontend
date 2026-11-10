import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { getEstadoAlquiler, PESTANAS_ALQUILERES } from '../utils/alquileres'

// Nombre de cada parámetro en la URL (/admin/alquileres?tab=historial&estado=FINALIZADO&cliente=4&pagina=2)
const PARAMS = Object.freeze({
  tab: 'tab',
  estado: 'estado',
  clienteId: 'cliente',
  page: 'pagina',
})

const PESTANA_POR_DEFECTO = PESTANAS_ALQUILERES[0].id

function toPositiveInt(value) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

/*
 * Pestaña, filtros del Historial (estado y cliente) y página del listado de alquileres, guardados en la URL:
 * sobreviven a recargar y a volver desde el detalle. Lo que no sea válido (una pestaña o un estado que no existen, un
 * cliente o una página que no son un número positivo) se ignora.
 * `setPestana` cambia de pestaña y descarta los filtros y la página (los filtros son solo del Historial);
 * `setFiltros` recibe solo los que cambian y vuelve a la página 1; `setPage` cambia solo la página.
 * Se reemplaza la entrada del historial: "atrás" lleva a la pantalla anterior, no a la pestaña o al filtro anterior
 */
export function useFiltrosAlquileres() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get(PARAMS.tab)
  const tab = PESTANAS_ALQUILERES.some(({ id }) => id === tabParam) ? tabParam : PESTANA_POR_DEFECTO
  const estadoParam = searchParams.get(PARAMS.estado)
  const estado = getEstadoAlquiler(estadoParam) ? estadoParam : ''
  const clienteId = toPositiveInt(searchParams.get(PARAMS.clienteId))
  const page = toPositiveInt(searchParams.get(PARAMS.page)) ?? 1

  const filtros = useMemo(() => ({ tab, estado, clienteId, page }), [tab, estado, clienteId, page])

  // Los valores vacíos, la pestaña por defecto y la página 1 no se escriben: la URL queda lo más corta posible
  const update = useCallback(
    (cambios) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [clave, valor] of Object.entries(cambios)) {
            const vacio =
              valor === '' ||
              valor === null ||
              (clave === 'page' && valor === 1) ||
              (clave === 'tab' && valor === PESTANA_POR_DEFECTO)
            if (vacio) next.delete(PARAMS[clave])
            else next.set(PARAMS[clave], String(valor))
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setPestana = useCallback(
    (nueva) => update({ tab: nueva, estado: '', clienteId: null, page: 1 }),
    [update],
  )
  const setFiltros = useCallback((cambios) => update({ ...cambios, page: 1 }), [update])
  const setPage = useCallback((value) => update({ page: value }), [update])
  const limpiarFiltros = useCallback(() => update({ estado: '', clienteId: null, page: 1 }), [update])

  const hasFilters = Boolean(estado || clienteId)

  return { filtros, hasFilters, setPestana, setFiltros, setPage, limpiarFiltros }
}
