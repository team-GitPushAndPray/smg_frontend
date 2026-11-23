import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { FILTROS_TIPO_AVISO, PESTANAS_AVISOS, SECCIONES_AVISOS } from '../utils/avisos'

// Nombre de cada parámetro en la URL (/admin/avisos?tab=configuracion, /admin/avisos?estado=atendidos&tipo=service)
const PARAMS = Object.freeze({
  seccion: 'tab',
  estado: 'estado',
  tipo: 'tipo',
})

// Los que se ven al entrar: no se escriben en la URL
const POR_DEFECTO = Object.freeze({
  seccion: SECCIONES_AVISOS[0].id,
  estado: PESTANAS_AVISOS[0].id,
  tipo: 'todos',
})

function elegir(valor, validos, porDefecto) {
  return validos.some(({ id }) => id === valor) ? valor : porDefecto
}

/*
 * Sección de /admin/avisos (Avisos / Configuración / Registro de envíos, en ?tab=) y, dentro de Avisos, la pestaña
 * (Pendientes / Atendidos, en ?estado=) y el filtro por tipo (?tipo=), guardados en la URL: sobreviven a recargar y
 * a volver desde otra pantalla. Un valor que no existe se ignora (queda el de por defecto).
 * Cambiar de sección conserva la pestaña y el filtro de Avisos, para encontrarlos igual al volver; el tipo es el mismo
 * en Pendientes y en Atendidos.
 * Se reemplaza la entrada del historial: "atrás" lleva a la pantalla anterior, no a la pestaña o al filtro anterior
 */
export function useFiltrosAvisos() {
  const [searchParams, setSearchParams] = useSearchParams()

  const seccion = elegir(searchParams.get(PARAMS.seccion), SECCIONES_AVISOS, POR_DEFECTO.seccion)
  const estado = elegir(searchParams.get(PARAMS.estado), PESTANAS_AVISOS, POR_DEFECTO.estado)
  const tipoParam = searchParams.get(PARAMS.tipo)
  const tipo = Object.hasOwn(FILTROS_TIPO_AVISO, tipoParam ?? '') ? tipoParam : POR_DEFECTO.tipo

  const filtros = useMemo(() => ({ tab: estado, tipo }), [estado, tipo])

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

  const setSeccion = useCallback((valor) => update('seccion', valor), [update])
  const setPestana = useCallback((valor) => update('estado', valor), [update])
  const setTipo = useCallback((valor) => update('tipo', valor), [update])

  return { seccion, filtros, hayFiltroTipo: tipo !== POR_DEFECTO.tipo, setSeccion, setPestana, setTipo }
}
