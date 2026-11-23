import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { FILTROS_CANAL_ENVIO, FILTROS_ESTADO_ENVIO } from '../utils/notificaciones'

/*
 * Nombre de cada parámetro en la URL (/admin/avisos?tab=registro&envio=error&canal=telegram&pagina=2). El estado del
 * envío va en ?envio= porque ?estado= ya es la pestaña Pendientes / Atendidos de la sección Avisos
 */
const PARAMS = Object.freeze({
  estado: 'envio',
  canal: 'canal',
  page: 'pagina',
})

// Los que se ven al entrar: no se escriben en la URL
const POR_DEFECTO = Object.freeze({ estado: 'todos', canal: 'todos', page: 1 })

function toPositiveInt(value) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

function elegir(valor, validos, porDefecto) {
  return Object.hasOwn(validos, valor ?? '') ? valor : porDefecto
}

/*
 * Filtros (estado y canal) y página del Registro de envíos, guardados en la URL junto a la sección (?tab=registro):
 * sobreviven a recargar la página. Un valor que no existe se ignora (queda el de por defecto).
 * `filtros.estado` y `filtros.canal` son las claves de FILTROS_ESTADO_ENVIO y FILTROS_CANAL_ENVIO ('todos', 'error'…).
 * `setFiltros` recibe solo los que cambian y vuelve a la página 1; `setPage` cambia solo la página.
 * Se reemplaza la entrada del historial: "atrás" lleva a la pantalla anterior, no al filtro anterior
 */
export function useFiltrosRegistro() {
  const [searchParams, setSearchParams] = useSearchParams()

  const estado = elegir(searchParams.get(PARAMS.estado), FILTROS_ESTADO_ENVIO, POR_DEFECTO.estado)
  const canal = elegir(searchParams.get(PARAMS.canal), FILTROS_CANAL_ENVIO, POR_DEFECTO.canal)
  const page = toPositiveInt(searchParams.get(PARAMS.page)) ?? POR_DEFECTO.page

  const filtros = useMemo(() => ({ estado, canal, page }), [estado, canal, page])

  const update = useCallback(
    (cambios) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [clave, valor] of Object.entries(cambios)) {
            if (valor === POR_DEFECTO[clave]) next.delete(PARAMS[clave])
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
  const limpiarFiltros = useCallback(() => update({ ...POR_DEFECTO }), [update])

  const hasFilters = estado !== POR_DEFECTO.estado || canal !== POR_DEFECTO.canal

  return { filtros, hasFilters, setFiltros, setPage, limpiarFiltros }
}
