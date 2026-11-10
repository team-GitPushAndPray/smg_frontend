import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { FILTROS_TIPO_AVISO, PESTANAS_AVISOS } from '../utils/avisos'

// Nombre de cada parámetro en la URL (/admin/avisos?tab=atendidos&tipo=service)
const PARAMS = Object.freeze({
  tab: 'tab',
  tipo: 'tipo',
})

// Los que se ven al entrar: no se escriben en la URL
const POR_DEFECTO = Object.freeze({
  tab: PESTANAS_AVISOS[0].id,
  tipo: 'todos',
})

/*
 * Pestaña (Pendientes / Atendidos) y filtro por tipo del centro de avisos, guardados en la URL: sobreviven a recargar
 * y a volver desde otra pantalla. Un valor que no existe se ignora (queda el de por defecto).
 * El tipo es el mismo en las dos pestañas: cambiar de pestaña lo conserva.
 * Se reemplaza la entrada del historial: "atrás" lleva a la pantalla anterior, no a la pestaña o al filtro anterior
 */
export function useFiltrosAvisos() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get(PARAMS.tab)
  const tab = PESTANAS_AVISOS.some(({ id }) => id === tabParam) ? tabParam : POR_DEFECTO.tab
  const tipoParam = searchParams.get(PARAMS.tipo)
  const tipo = Object.hasOwn(FILTROS_TIPO_AVISO, tipoParam ?? '') ? tipoParam : POR_DEFECTO.tipo

  const filtros = useMemo(() => ({ tab, tipo }), [tab, tipo])

  const update = useCallback(
    (clave, valor) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (valor === POR_DEFECTO[clave]) next.delete(PARAMS[clave])
          else next.set(PARAMS[clave], valor)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setPestana = useCallback((valor) => update('tab', valor), [update])
  const setTipo = useCallback((valor) => update('tipo', valor), [update])

  return { filtros, hayFiltroTipo: tipo !== POR_DEFECTO.tipo, setPestana, setTipo }
}
