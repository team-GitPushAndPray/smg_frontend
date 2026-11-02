import { useCallback, useEffect, useMemo, useReducer } from 'react'
import {
  borrarBorradores,
  DATOS_CHECKLIST_INICIALES,
  getPasosChecklist,
  guardarBorrador,
  leerBorrador,
  leerResponsable,
  MAX_FOTOS,
} from '../utils/checklists'
import { ChecklistContext } from './ChecklistContext'

/*
 * Estado del asistente: el tipo elegido, el paso actual (por su id: 'inicio', 'horas', 'items' o 'cierre')
 * y los datos cargados. `borrador` es el que quedó sin terminar, mientras se decide si seguirlo o empezar de nuevo.
 * `datosIniciales` son los de un checklist nuevo: vacíos, salvo el responsable recordado en el celular.
 * `fotos` (los File ya comprimidos) va aparte de `datos` porque no entra en el borrador; `fotosPerdidas` marca
 * que el borrador retomado tenía fotos, para pedir que las vuelva a sacar, hasta que saque una
 */
function crearEstado({ pasos, borrador, datosIniciales }) {
  return {
    pasos,
    borrador,
    datosIniciales,
    tipo: null,
    paso: 'inicio',
    datos: datosIniciales,
    fotos: [],
    fotosPerdidas: false,
  }
}

function reducer(state, action) {
  const indice = state.pasos.indexOf(state.paso)

  switch (action.type) {
    case 'seguir-borrador': {
      const { tipo, paso, datos, conFotos } = state.borrador
      return {
        ...state,
        borrador: null,
        tipo,
        datos,
        fotosPerdidas: conFotos,
        paso: state.pasos.includes(paso) ? paso : 'inicio',
      }
    }
    case 'descartar-borrador':
      return crearEstado({ ...state, borrador: null })
    case 'elegir-tipo': {
      // Volver a elegir el mismo tipo conserva lo cargado; otro tipo empieza de cero
      const mismoTipo = action.tipo === state.tipo
      return {
        ...state,
        tipo: action.tipo,
        datos: mismoTipo ? state.datos : state.datosIniciales,
        fotos: mismoTipo ? state.fotos : [],
        fotosPerdidas: mismoTipo && state.fotosPerdidas,
        paso: state.pasos[1],
      }
    }
    case 'avanzar':
      return { ...state, paso: state.pasos[Math.min(indice + 1, state.pasos.length - 1)] }
    case 'retroceder':
      return { ...state, paso: state.pasos[Math.max(indice - 1, 0)] }
    case 'actualizar-datos':
      return { ...state, datos: { ...state.datos, ...action.campos } }
    case 'poner-foto': {
      // En un lugar con foto la reemplaza ("Sacar otra"); en uno vacío la suma al final
      const fotos = [...state.fotos]
      fotos[Math.min(action.indice, fotos.length)] = action.foto
      return { ...state, fotos: fotos.slice(0, MAX_FOTOS), fotosPerdidas: false }
    }
    case 'quitar-foto':
      return { ...state, fotos: state.fotos.filter((_, indice) => indice !== action.indice) }
    default:
      return state
  }
}

/*
 * Flujo de un checklist de campo, compartido entre los pasos del asistente. Recibe el formulario que devolvió
 * el back para el token del QR. Cada cambio se guarda como borrador en localStorage (sin las fotos) y, si al abrir
 * el link había uno sin terminar, se ofrece seguirlo. Un checklist nuevo arranca con el nombre y apellido del último envío.
 * Con un checklist empezado, cerrar o recargar la pestaña pide confirmación.
 * Montarlo con key={token}: el estado es de un solo equipo
 */
export default function ChecklistProvider({ token, formulario, children }) {
  const { equipo, opciones } = formulario
  const tipos = useMemo(() => opciones.map(({ tipo }) => tipo), [opciones])

  const [state, dispatch] = useReducer(reducer, null, () =>
    crearEstado({
      pasos: getPasosChecklist(equipo.esMaquina),
      borrador: leerBorrador(token, tipos),
      datosIniciales: { ...DATOS_CHECKLIST_INICIALES, ...leerResponsable() },
    }),
  )
  const { pasos, borrador, tipo, paso, datos, fotos, fotosPerdidas } = state

  // Si se recarga antes de volver a sacar las fotos perdidas, el aviso tiene que seguir apareciendo
  const conFotos = fotos.length > 0 || fotosPerdidas
  useEffect(() => {
    if (tipo) guardarBorrador(token, tipos, { tipo, paso, datos, conFotos })
  }, [token, tipos, tipo, paso, datos, conFotos])

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
  const ponerFoto = useCallback((indice, foto) => dispatch({ type: 'poner-foto', indice, foto }), [])
  const quitarFoto = useCallback((indice) => dispatch({ type: 'quitar-foto', indice }), [])

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
      fotos,
      fotosPerdidas,
      seguirBorrador,
      descartarBorrador,
      elegirTipo,
      avanzar,
      retroceder,
      actualizarDatos,
      ponerFoto,
      quitarFoto,
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
      fotos,
      fotosPerdidas,
      seguirBorrador,
      descartarBorrador,
      elegirTipo,
      avanzar,
      retroceder,
      actualizarDatos,
      ponerFoto,
      quitarFoto,
    ],
  )

  return <ChecklistContext.Provider value={value}>{children}</ChecklistContext.Provider>
}
