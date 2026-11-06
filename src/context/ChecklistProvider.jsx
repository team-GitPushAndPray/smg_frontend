import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import {
  borrarBorradores,
  DATOS_CHECKLIST_INICIALES,
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
 * `datosIniciales` son los de un checklist nuevo: vacíos, salvo lo que precarga la página (las horas actuales, en un
 * alquiler) y el responsable recordado en el celular (solo si se pide).
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
 * Flujo de un checklist hecho con el asistente de campo, compartido entre sus pasos. Lo usan el QR de M06
 * (ChecklistPage) y la entrega o devolución de un equipo alquilado (RentalChecklistPage).
 * `clave` identifica el borrador: cada cambio se guarda en localStorage (sin las fotos) y, si al abrir había uno sin
 * terminar, se ofrece seguirlo. Con un checklist empezado, cerrar o recargar la pestaña pide confirmación.
 * `formulario` es { equipo, opciones } con los nombres del front; `datosIniciales` precarga campos de cada checklist nuevo.
 * `responsable`: null pide nombre y apellido (QR: un checklist nuevo arranca con los del último envío); con un texto
 * no se pide, la revisión lo muestra y el back usa el usuario de la sesión.
 * `enviarChecklist({ tipo, items, esMaquina, datos, fotos })` hace el POST y devuelve la respuesta: `enviar` lo llama
 * una sola vez aunque se toque dos veces. Si sale bien, borra el borrador y:
 *  - con `onEnviado(respuesta)`, la página sigue sola (por ejemplo, vuelve al alquiler): el asistente queda "Enviando…";
 *  - sin él, muestra "Listo", recuerda al responsable y pide de nuevo el formulario (`onRefrescar`) para las horas nuevas.
 * Si falla, `onErrorEnvio(error)` puede tomarlo (devuelve true y la página muestra otra cosa); si no, el error lleva
 * al paso que lo corrige y, con un 409, también se pide de nuevo el formulario para actualizar las horas.
 * Montarlo con key={clave}: el estado es de un solo equipo
 */
export default function ChecklistProvider({
  clave,
  formulario,
  datosIniciales: precargados = null,
  responsable = null,
  enviarChecklist,
  onEnviado,
  onErrorEnvio,
  onRefrescar,
  children,
}) {
  const { equipo, opciones } = formulario
  const tipos = useMemo(() => opciones.map(({ tipo }) => tipo), [opciones])
  const pideResponsable = responsable == null

  const [state, dispatch] = useReducer(reducer, null, () =>
    crearEstado({
      pasos: getPasosChecklist(equipo.esMaquina),
      borrador: leerBorrador(clave, tipos),
      datosIniciales: { ...DATOS_CHECKLIST_INICIALES, ...precargados, ...(pideResponsable && leerResponsable()) },
    }),
  )
  const { pasos, borrador, tipo, paso, datos, fotos, fotosPerdidas, editando, enviando, errorEnvio, resultado } = state
  const opcion = useMemo(() => opciones.find((item) => item.tipo === tipo) ?? null, [opciones, tipo])

  // Si se recarga antes de volver a sacar las fotos perdidas, el aviso tiene que seguir apareciendo
  const conFotos = fotos.length > 0 || fotosPerdidas
  useEffect(() => {
    if (tipo) guardarBorrador(clave, tipos, { tipo, paso, datos, conFotos })
  }, [clave, tipos, tipo, paso, datos, conFotos])

  useEffect(() => {
    if (!tipo) return
    const onBeforeUnload = (event) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [tipo])

  const seguirBorrador = useCallback(() => dispatch({ type: 'seguir-borrador' }), [])
  const descartarBorrador = useCallback(() => {
    borrarBorradores(clave, tipos)
    dispatch({ type: 'descartar-borrador' })
  }, [clave, tipos])
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
      const respuesta = await enviarChecklist({ tipo, items: opcion.items, esMaquina: equipo.esMaquina, datos, fotos })
      borrarBorradores(clave, tipos)
      if (onEnviado) {
        onEnviado(respuesta)
        return
      }
      const recordado = pideResponsable ? { nombre: datos.nombre.trim(), apellido: datos.apellido.trim() } : null
      if (recordado) guardarResponsable(recordado)
      dispatch({
        type: 'envio-exitoso',
        resultado: { ...respuesta, titulo: opcion.titulo, codigoInterno: equipo.codigoInterno },
        datosIniciales: { ...DATOS_CHECKLIST_INICIALES, ...precargados, ...recordado },
      })
      onRefrescar?.()
    } catch (error) {
      if (onErrorEnvio?.(error)) return
      dispatch({ type: 'envio-fallido', error: getErrorEnvio(error, pasos) })
      if (error.status === 409) onRefrescar?.()
    } finally {
      enviandoRef.current = false
    }
  }, [
    opcion,
    tipo,
    equipo,
    datos,
    clave,
    fotos,
    tipos,
    pasos,
    precargados,
    pideResponsable,
    enviarChecklist,
    onEnviado,
    onErrorEnvio,
    onRefrescar,
  ])

  const value = useMemo(
    () => ({
      clave,
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
      pideResponsable,
      responsable,
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
      clave,
      equipo,
      opciones,
      opcion,
      borrador,
      pasos,
      paso,
      datos,
      fotos,
      fotosPerdidas,
      pideResponsable,
      responsable,
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
