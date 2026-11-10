import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { getEstadoPostulacion } from '../utils/postulaciones'
import { PESTANAS_POSTULACIONES } from '../utils/vacantes'

/** @import { FiltrosPostulaciones } from '../types/postulaciones' */

// Nombre de cada parámetro en la URL (/admin/postulaciones?vacante_id=1&estado=NUEVO, /admin/postulaciones?tab=vacantes)
const PARAMS = Object.freeze({
  tab: 'tab',
  vacanteId: 'vacante_id',
  estado: 'estado',
})

const TAB_POR_DEFECTO = PESTANAS_POSTULACIONES[0].id

function toPositiveInt(value) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

/*
 * Pestaña activa del módulo Postulaciones (Bandeja / Vacantes) y filtros de la Bandeja (vacante y estado), guardados
 * en la URL: sobreviven a recargar y a volver desde la ficha. Lo que no sea válido (una pestaña o un estado que no
 * existen, una vacante que no es un número positivo) se ignora; "Todas" / "Todos" y la pestaña por defecto no se
 * escriben. `setPestana` cambia de pestaña y descarta los filtros (son solo de la Bandeja); `setFiltros` recibe solo
 * los que cambian. Se reemplaza la entrada del historial: "atrás" lleva a la pantalla anterior, no al filtro anterior
 */
export function useFiltrosPostulaciones() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get(PARAMS.tab)
  const tab = PESTANAS_POSTULACIONES.some(({ id }) => id === tabParam) ? tabParam : TAB_POR_DEFECTO
  const vacanteId = toPositiveInt(searchParams.get(PARAMS.vacanteId))
  const estadoParam = searchParams.get(PARAMS.estado)
  const estado = getEstadoPostulacion(estadoParam) ? estadoParam : ''

  /** @type {FiltrosPostulaciones} */
  const filtros = useMemo(() => ({ vacanteId, estado }), [vacanteId, estado])

  const update = useCallback(
    (cambios) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [clave, valor] of Object.entries(cambios)) {
            const vacio = valor === '' || valor === null || (clave === 'tab' && valor === TAB_POR_DEFECTO)
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

  const setPestana = useCallback((valor) => update({ tab: valor, vacanteId: null, estado: '' }), [update])
  const setFiltros = useCallback((cambios) => update(cambios), [update])
  const limpiarFiltros = useCallback(() => update({ vacanteId: null, estado: '' }), [update])

  const hasFilters = Boolean(vacanteId || estado)

  return { tab, filtros, hasFilters, setPestana, setFiltros, limpiarFiltros }
}
