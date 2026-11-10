import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { PESTANAS_POSTULACIONES } from '../utils/vacantes'

const PARAM_TAB = 'tab'
const TAB_POR_DEFECTO = PESTANAS_POSTULACIONES[0].id

/*
 * Pestaña activa del módulo Postulaciones (Bandeja / Vacantes), guardada en la URL (/admin/postulaciones?tab=vacantes):
 * sobrevive a recargar y a volver desde otra pantalla. Un valor que no existe se ignora (queda Bandeja), y la de por
 * defecto no se escribe. Se reemplaza la entrada del historial: "atrás" lleva a la pantalla anterior, no a la pestaña
 */
export function useFiltrosPostulaciones() {
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get(PARAM_TAB)
  const tab = PESTANAS_POSTULACIONES.some(({ id }) => id === tabParam) ? tabParam : TAB_POR_DEFECTO

  const setPestana = useCallback(
    (valor) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (valor === TAB_POR_DEFECTO) next.delete(PARAM_TAB)
          else next.set(PARAM_TAB, valor)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { tab, setPestana }
}
