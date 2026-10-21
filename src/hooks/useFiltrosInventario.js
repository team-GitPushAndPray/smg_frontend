import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { ESTADOS_EQUIPO, TIPOS_EQUIPO } from '../utils/equipos'

// Nombre de cada filtro en la URL (/admin/maquinas?buscar=volvo&tipo=maquina&pagina=2)
const PARAMS = Object.freeze({
  search: 'buscar',
  tipo: 'tipo',
  estado: 'estado',
  categoriaId: 'categoria',
  bajas: 'bajas',
  page: 'pagina',
})

function toPositiveInt(value) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

/*
 * Filtros y página del inventario guardados en la URL: sobreviven a recargar y a volver atrás desde otra pantalla.
 * Lo que no sea válido (un estado que no existe, una página negativa) se ignora.
 * `setFiltros` recibe solo los que cambian y vuelve a la página 1; `setPage` cambia solo la página.
 * Se reemplaza la entrada del historial: "atrás" lleva a la pantalla anterior, no al filtro anterior
 */
export function useFiltrosInventario() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get(PARAMS.search)?.trim() ?? ''
  const tipo = searchParams.get(PARAMS.tipo)
  const estado = searchParams.get(PARAMS.estado)
  const categoriaId = toPositiveInt(searchParams.get(PARAMS.categoriaId))
  const bajas = searchParams.get(PARAMS.bajas) === '1'
  const page = toPositiveInt(searchParams.get(PARAMS.page)) ?? 1

  const filtros = useMemo(
    () => ({
      search,
      tipo: Object.hasOwn(TIPOS_EQUIPO, tipo) ? tipo : '',
      estado: Object.hasOwn(ESTADOS_EQUIPO, estado) ? estado : '',
      categoriaId,
      bajas,
      page,
    }),
    [search, tipo, estado, categoriaId, bajas, page],
  )

  // Los valores vacíos (o la página 1, o el switch apagado) no se escriben: la URL queda lo más corta posible
  const update = useCallback(
    (cambios) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [clave, valor] of Object.entries(cambios)) {
            const vacio = valor === '' || valor === null || valor === false || (clave === 'page' && valor === 1)
            if (vacio) next.delete(PARAMS[clave])
            else next.set(PARAMS[clave], valor === true ? '1' : String(valor))
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setFiltros = useCallback((cambios) => update({ ...cambios, page: 1 }), [update])
  const setPage = useCallback((value) => update({ page: value }), [update])
  const limpiarFiltros = useCallback(
    () => update({ search: '', tipo: '', estado: '', categoriaId: null, bajas: false, page: 1 }),
    [update],
  )

  const hasFilters = Boolean(filtros.search || filtros.tipo || filtros.estado || filtros.categoriaId || filtros.bajas)

  return { filtros, hasFilters, setFiltros, setPage, limpiarFiltros }
}
