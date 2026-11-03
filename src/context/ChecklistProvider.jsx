import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { enviarChecklist } from '../services/checklistsService'
import {
  borrarBorradores,
  DATOS_CHECKLIST_INICIALES,
  getDatosEnvio,
  getErrorEnvio,
  getPasosChecklist,
  guardarBorrador,
  guardarResponsable,
  leerBorrador,
  leerResponsable,
  MAX_FOTOS,
} from '../utils/checklists'
import { ChecklistContext } from './ChecklistContext'

/*
 * Estado del asistente: el tipo elegido, el paso actual (por su id: 'inicio', 'horas', 'items', 'cierre' o 'revision')
 * y los datos cargados. `borrador` es el que quedó sin terminar, mientras se decide si seguirlo o empezar de nuevo.
 * `datosIniciales` son los de un checklist nuevo: vacíos, salvo el responsable recordado en el celular.
 * `fotos` (los File ya comprimidos) va aparte de `datos` porque no entra en el borrador; `fotosPerdidas` marca
 * que el borrador retomado tenía fotos, para pedir que las vuelva a sacar, hasta que saque una.
 * `editando` es que se llegó a un paso desde la revisión ("Editar" o un error del envío): su botón principal
 * vuelve directo a la revisión. `errorEnvio` ({ paso, mensaje, red }) se muestra en su paso hasta salir de él.
 * `resultado` es la respuesta de un envío exitoso, mientras se muestra "Listo"
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
    editando: false,
    enviando: false,
    errorEnvio: null,
    resultado: null,
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
      // Volver a elegir el mismo tipo conserva lo cargado (y si venía de la revisión, vuelve a ella); otro tipo empieza de cero
      const mismoTipo = action.tipo === state.tipo
      return {
        ...state,
        tipo: action.tipo,
        datos: mismoTipo ? state.datos : state.datosIniciales,
        fotos: mismoTipo ? state.fotos : [],
        fotosPerdidas: mismoTipo && state.fotosPerdidas,
        paso: mismoTipo && state.editando ? 'revision' : state.pasos[1],
        editando: false,
        errorEnvio: null,
      }
    }
    case 'avanzar':
      if (state.editando) return { ...state, paso: 'revision', editando: false, errorEnvio: null }
      return { ...state, paso: state.pasos[Math.min(indice + 1, state.pasos.length - 1)], errorEnvio: null }
    case 'retroceder':
      return { ...state, paso: state.pasos[Math.max(indice - 1, 0)], errorEnvio: null }
    case 'editar-paso':
      return { ...state, paso: action.paso, editando: true, errorEnvio: null }
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
    case 'envio-iniciado':
      return { ...state, enviando: true, errorEnvio: null }
    case 'envio-fallido': {
      // Nada de lo cargado se toca: solo se lleva al paso que corrige el error
      const { paso } = action.error
      return { ...state, enviando: false, errorEnvio: action.error, paso, editando: paso !== 'revision' }
    }
    case 'envio-exitoso':
      // El checklist enviado se descarta entero: el próximo arranca de cero, con el responsable de este
      return {
        ...crearEstado({ pasos: state.pasos, borrador: null, datosIniciales: action.datosIniciales }),
        resultado: action.resultado,
      }
    case 'otro-checklist':
      return { ...state, resultado: null }
    default:
      return state
  }
}

/*
 * Flujo de un checklist de campo, compartido entre los pasos del asistente. Recibe el formulario que devolvió
 * el back para el token del QR. Cada cambio se guarda como borrador en localStorage (sin las fotos) y, si al abrir
 * el link había uno sin terminar, se ofrece seguirlo. Un checklist nuevo arranca con el nombre y apellido del último envío.
 * Con un checklist empezado, cerrar o recargar la pestaña pide confirmación.
 * `enviar` hace el POST una sola vez aunque se toque dos veces; si sale bien borra el borrador, recuerda al responsable
 * y pide de nuevo el formulario (`onRefrescar`) para que el inicio muestre las horas nuevas. Con un 409 también lo
 * pide, para actualizar las horas a corregir.
 * Montarlo con key={token}: el estado es de un solo equipo
 */
export default function ChecklistProvider({ token, formulario, onRefrescar, children }) {
  const { equipo, opciones } = formulario
  const tipos = useMemo(() => opciones.map(({ tipo }) => tipo), [opciones])

  const [state, dispatch] = useReducer(reducer, null, () =>
    crearEstado({
      pasos: getPasosChecklist(equipo.esMaquina),
      borrador: leerBorrador(token, tipos),
      datosIniciales: { ...DATOS_CHECKLIST_INICIALES, ...leerResponsable() },
    }),
  )
  const { pasos, borrador, tipo, paso, datos, fotos, fotosPerdidas, editando, enviando, errorEnvio, resultado } = state
  const opcion = useMemo(() => opciones.find((item) => item.tipo === tipo) ?? null, [opciones, tipo])

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
  const editarPaso = useCallback((destino) => dispatch({ type: 'editar-paso', paso: destino }), [])
  const actualizarDatos = useCallback((campos) => dispatch({ type: 'actualizar-datos', campos }), [])
  const ponerFoto = useCallback((indice, foto) => dispatch({ type: 'poner-foto', indice, foto }), [])
  const quitarFoto = useCallback((indice) => dispatch({ type: 'quitar-foto', indice }), [])
  const otroChecklist = useCallback(() => dispatch({ type: 'otro-checklist' }), [])

  // El estado `enviando` llega con el próximo render: la ref frena un segundo toque que entre antes
  const enviandoRef = useRef(false)
  const enviar = useCallback(async () => {
    if (enviandoRef.current || !opcion) return
    enviandoRef.current = true
    dispatch({ type: 'envio-iniciado' })

    try {
      const datosEnvio = getDatosEnvio({ tipo, items: opcion.items, esMaquina: equipo.esMaquina, datos })
      const respuesta = await enviarChecklist(token, { datos: datosEnvio, fotos })
      const responsable = { nombre: datos.nombre.trim(), apellido: datos.apellido.trim() }
      borrarBorradores(token, tipos)
      guardarResponsable(responsable)
      dispatch({
        type: 'envio-exitoso',
        resultado: { ...respuesta, titulo: opcion.titulo, codigoInterno: equipo.codigoInterno },
        datosIniciales: { ...DATOS_CHECKLIST_INICIALES, ...responsable },
      })
      onRefrescar?.()
    } catch (error) {
      dispatch({ type: 'envio-fallido', error: getErrorEnvio(error, pasos) })
      if (error.status === 409) onRefrescar?.()
    } finally {
      enviandoRef.current = false
    }
  }, [opcion, tipo, equipo, datos, token, fotos, tipos, pasos, onRefrescar])

  const value = useMemo(
    () => ({
      token,
      equipo,
      opciones,
      opcion,
      borrador,
      pasos,
      paso,
      numeroPaso: pasos.indexOf(paso) + 1,
      totalPasos: pasos.length,
      datos,
      fotos,
      fotosPerdidas,
      editando,
      enviando,
      errorEnvio,
      resultado,
      seguirBorrador,
      descartarBorrador,
      elegirTipo,
      avanzar,
      retroceder,
      editarPaso,
      actualizarDatos,
      ponerFoto,
      quitarFoto,
      enviar,
      otroChecklist,
    }),
    [
      token,
      equipo,
      opciones,
      opcion,
      borrador,
      pasos,
      paso,
      datos,
      fotos,
      fotosPerdidas,
      editando,
      enviando,
      errorEnvio,
      resultado,
      seguirBorrador,
      descartarBorrador,
      elegirTipo,
      avanzar,
      retroceder,
      editarPaso,
      actualizarDatos,
      ponerFoto,
      quitarFoto,
      enviar,
      otroChecklist,
    ],
  )

  return <ChecklistContext.Provider value={value}>{children}</ChecklistContext.Provider>
}
