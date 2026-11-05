import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { esFechaFiltro, TIPOS_CHECKLIST } from '../utils/historial'

// Nombre de cada filtro en la URL (/admin/maquinas/7/historial?tab=checklists&desde=2026-10-01&tipo=DIARIO&pagina=2)
const PARAMS = Object.freeze({
  desde: 'desde',
  hasta: 'hasta',
  tipo: 'tipo',
  responsable: 'responsable',
  q: 'q',
  page: 'pagina',
})

const VACIOS = Object.freeze({ desde: '', hasta: '', tipo: '', responsable: '', q: '' })

function toPositiveInt(value) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

/*
 * Filtros y página de los checklists del historial, guardados en la URL junto a la pestaña (?tab=): sobreviven a
 * recargar y a volver desde el detalle, y el PDF puede usar los mismos. Lo que no sea válido (una fecha que no
 * existe, un tipo desconocido, una página negativa) se ignora; un rango al revés también ("hasta" se descarta),
 * para no mandarle al back algo que rechaza con 400.
 * `setFiltros` recibe solo los que cambian y vuelve a la página 1; `setPage` cambia solo la página.
 * Se reemplaza la entrada del historial: "atrás" lleva a la pantalla anterior, no al filtro anterior
 */
export function useFiltrosHistorial() {
  const [searchParams, setSearchParams] = useSearchParams()

  const leerFecha = (clave) => {
    const valor = searchParams.get(PARAMS[clave])
    return esFechaFiltro(valor) ? valor : ''
  }

  const desde = leerFecha('desde')
  const hastaUrl = leerFecha('hasta')
  const hasta = desde && hastaUrl && hastaUrl < desde ? '' : hastaUrl
  const tipoUrl = searchParams.get(PARAMS.tipo)
  const tipo = Object.hasOwn(TIPOS_CHECKLIST, tipoUrl) ? tipoUrl : ''
  const responsable = searchParams.get(PARAMS.responsable)?.trim() ?? ''
  const q = searchParams.get(PARAMS.q)?.trim() ?? ''
  const page = toPositiveInt(searchParams.get(PARAMS.page)) ?? 1

  const filtros = useMemo(
    () => ({ desde, hasta, tipo, responsable, q, page }),
    [desde, hasta, tipo, responsable, q, page],
  )

  // Los valores vacíos (o la página 1) no se escriben: la URL queda lo más corta posible
  const update = useCallback(
    (cambios) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [clave, valor] of Object.entries(cambios)) {
            const vacio = valor === '' || valor === null || (clave === 'page' && valor === 1)
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

  const setFiltros = useCallback((cambios) => update({ ...cambios, page: 1 }), [update])
  const setPage = useCallback((value) => update({ page: value }), [update])
  const limpiarFiltros = useCallback(() => update({ ...VACIOS, page: 1 }), [update])

  const hasFilters = Boolean(desde || hasta || tipo || responsable || q)

  return { filtros, hasFilters, setFiltros, setPage, limpiarFiltros }
}
