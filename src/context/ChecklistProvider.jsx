import { useCallback, useEffect, useMemo, useReducer } from 'react'
import {
  borrarBorradores,
  DATOS_CHECKLIST_INICIALES,
  getPasosChecklist,
  guardarBorrador,
  leerBorrador,
} from '../utils/checklists'
import { ChecklistContext } from './ChecklistContext'

/*
 * Estado del asistente: el tipo elegido, el paso actual (por su id: 'inicio', 'horas', 'items' o 'cierre')
 * y los datos cargados. `borrador` es el que quedó sin terminar, mientras se decide si seguirlo o empezar de nuevo
 */
function crearEstado({ pasos, borrador }) {
  return { pasos, borrador, tipo: null, paso: 'inicio', datos: DATOS_CHECKLIST_INICIALES }
}

function reducer(state, action) {
  const indice = state.pasos.indexOf(state.paso)

  switch (action.type) {
    case 'seguir-borrador': {
      const { tipo, paso, datos } = state.borrador
      return { ...state, borrador: null, tipo, datos, paso: state.pasos.includes(paso) ? paso : 'inicio' }
    }
    case 'descartar-borrador':
      return crearEstado({ pasos: state.pasos, borrador: null })
    case 'elegir-tipo':
      // Volver a elegir el mismo tipo conserva lo cargado; otro tipo empieza de cero
      return {
        ...state,
        tipo: action.tipo,
        datos: action.tipo === state.tipo ? state.datos : DATOS_CHECKLIST_INICIALES,
        paso: state.pasos[1],
      }
    case 'avanzar':
      return { ...state, paso: state.pasos[Math.min(indice + 1, state.pasos.length - 1)] }
    case 'retroceder':
      return { ...state, paso: state.pasos[Math.max(indice - 1, 0)] }
    case 'actualizar-datos':
      return { ...state, datos: { ...state.datos, ...action.campos } }
    default:
      return state
  }
}

/*
 * Flujo de un checklist de campo, compartido entre los pasos del asistente. Recibe el formulario que devolvió
 * el back para el token del QR. Cada cambio se guarda como borrador en localStorage y, si al abrir el link
 * había uno sin terminar, se ofrece seguirlo. Con un checklist empezado, cerrar o recargar la pestaña pide confirmación.
 * Montarlo con key={token}: el estado es de un solo equipo
 */
export default function ChecklistProvider({ token, formulario, children }) {
  const { equipo, opciones } = formulario
  const tipos = useMemo(() => opciones.map(({ tipo }) => tipo), [opciones])

  const [state, dispatch] = useReducer(reducer, null, () =>
    crearEstado({ pasos: getPasosChecklist(equipo.esMaquina), borrador: leerBorrador(token, tipos) }),
  )
  const { pasos, borrador, tipo, paso, datos } = state

  useEffect(() => {
    if (tipo) guardarBorrador(token, tipos, { tipo, paso, datos })
  }, [token, tipos, tipo, paso, datos])

  useEffect(() => {
    if (!tipo) return
    const onBeforeUnload = (event) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [tipo])

  const seguirBorrador = useCallback(() => dispatch({ type: 'seguir-borrador' }), [])
  const descartarBorrador = useCallback(() => {
    borrarBorradores(token, tipos)
    dispatch({ type: 'descartar-borrador' })
  }, [token, tipos])
  const elegirTipo = useCallback((nuevo) => dispatch({ type: 'elegir-tipo', tipo: nuevo }), [])
  const avanzar = useCallback(() => dispatch({ type: 'avanzar' }), [])
  const retroceder = useCallback(() => dispatch({ type: 'retroceder' }), [])
  const actualizarDatos = useCallback((campos) => dispatch({ type: 'actualizar-datos', campos }), [])

  const value = useMemo(
    () => ({
      token,
      equipo,
      opciones,
      opcion: opciones.find((item) => item.tipo === tipo) ?? null,
      borrador,
      pasos,
      paso,
      numeroPaso: pasos.indexOf(paso) + 1,
      totalPasos: pasos.length,
      datos,
      seguirBorrador,
      descartarBorrador,
      elegirTipo,
      avanzar,
      retroceder,
      actualizarDatos,
    }),
    [
      token,
      equipo,
      opciones,
      tipo,
      borrador,
      pasos,
      paso,
      datos,
      seguirBorrador,
      descartarBorrador,
      elegirTipo,
      avanzar,
      retroceder,
      actualizarDatos,
    ],
  )

  return <ChecklistContext.Provider value={value}>{children}</ChecklistContext.Provider>
}
