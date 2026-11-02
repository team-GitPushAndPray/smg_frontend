import { Check, ClipboardCheck, ClipboardList, Minus, Truck, Undo2, Wrench, X } from 'lucide-react'
import { formatHoras } from './equipos'

/*
 * Ícono de cada tipo de checklist, con la clave tal cual la manda el back. El título y qué opciones se muestran
 * los decide el back: el front no filtra ni reordena, solo les pone ícono (y uno genérico si llega uno nuevo)
 */
const ICONOS_CHECKLIST = Object.freeze({
  DIARIO: ClipboardCheck,
  MANTENIMIENTO: Wrench,
  ENTREGA: Truck,
  DEVOLUCION: Undo2,
})

export function getIconoChecklist(tipo) {
  return ICONOS_CHECKLIST[tipo] ?? ClipboardList
}

/*
 * Respuesta de GET /public/checklists/:token con los nombres del front. El equipo lleva `tipo` ('maquina' o
 * 'aditamento') como en el panel, así sirven los mismos formatos de horas (formatHorasMotor)
 */
export function adaptarFormularioChecklist(data) {
  const equipo = data?.equipo ?? {}
  const esMaquina = equipo.es_maquina === true
  return {
    equipo: {
      codigoInterno: equipo.codigo_interno ?? '',
      categoria: equipo.categoria ?? '',
      marca: equipo.marca ?? null,
      esMaquina,
      tipo: esMaquina ? 'maquina' : 'aditamento',
      horasMotorActual: equipo.horas_motor_actual ?? null,
      horasActualizadasEn: equipo.horas_actualizadas_en ?? null,
    },
    opciones: Array.isArray(data?.opciones)
      ? data.opciones.map(({ tipo, titulo, items }) => ({ tipo, titulo, items: Array.isArray(items) ? items : [] }))
      : [],
  }
}

/*
 * Pasos del asistente, en orden. Los aditamentos no tienen motor: no tienen paso de horas.
 * Enviar es la acción del último paso y la confirmación ya no cuenta como paso
 */
export function getPasosChecklist(esMaquina) {
  return esMaquina ? ['inicio', 'horas', 'items', 'cierre'] : ['inicio', 'items', 'cierre']
}

// Salto desde la última carga a partir del cual se pregunta si las horas están bien (frena un dígito de más)
export const SALTO_HORAS_A_CONFIRMAR = 200

/*
 * Horas que se escribieron en el paso de horas, contra las actuales del equipo (null si nunca se cargaron:
 * entonces no hay mínimo ni salto). `estado` es 'vacio', 'no-entero', 'menor' u 'ok'; con 'ok', `horas` es
 * el número y `salto` cuánto supera a las actuales
 */
export function validarHoras(valor, actuales) {
  const texto = valor.trim()
  if (texto === '') return { estado: 'vacio' }
  if (!/^\d+$/.test(texto)) return { estado: 'no-entero' }
  const horas = Number(texto)
  if (actuales != null && horas < actuales) return { estado: 'menor' }
  return { estado: 'ok', horas, salto: actuales == null ? 0 : horas - actuales }
}

/*
 * Estados de un ítem, con el valor que espera el back. En pantalla llevan color, ícono y texto: el estado
 * no depende solo del color
 */
export const ESTADOS_ITEM = Object.freeze([
  { valor: 'NORMAL', etiqueta: 'Normal', icono: Check },
  { valor: 'ANORMAL', etiqueta: 'Anormal', icono: X },
  { valor: 'NO_APLICA', etiqueta: 'No aplica', icono: Minus },
])

const VALORES_ESTADO = new Set(ESTADOS_ITEM.map(({ valor }) => valor))

// Estado respondido de un ítem, o null si falta (un valor raro que vuelva del borrador cuenta como pendiente)
export function getEstadoItem(respuestas, itemId) {
  const estado = respuestas[itemId]
  return VALORES_ESTADO.has(estado) ? estado : null
}

// En entrega y devolución hay ítems que no corresponden a todos los equipos: ahí se pueden marcar en bloque como No aplica
const TIPOS_CON_NO_APLICA_MASIVO = new Set(['ENTREGA', 'DEVOLUCION'])

export function permiteNoAplicaMasivo(tipo) {
  return TIPOS_CON_NO_APLICA_MASIVO.has(tipo)
}

// Respuestas con los ítems pendientes marcados con `estado`; lo que ya estaba respondido no cambia
export function marcarPendientes(respuestas, items, estado) {
  const nuevas = { ...respuestas }
  items.forEach(({ id }) => {
    if (!getEstadoItem(respuestas, id)) nuevas[id] = estado
  })
  return nuevas
}

// Ítems marcados como Anormal, en el orden del back: el paso de cierre pide contar qué les pasa
export function getItemsAnormales(items, respuestas) {
  return items.filter(({ id }) => getEstadoItem(respuestas, id) === 'ANORMAL')
}

// "Marcaste 2 ítems como anormales: Luces delanteras, Aceite hidráulico. Contá qué les pasa."
export function textoAvisoAnormales(items) {
  const nombres = items.map(({ nombre }) => nombre).join(', ')
  return items.length === 1
    ? `Marcaste 1 ítem como anormal: ${nombres}. Contá qué le pasa.`
    : `Marcaste ${items.length} ítems como anormales: ${nombres}. Contá qué les pasa.`
}

export const MAX_OBSERVACIONES = 1000

// Ayuda de las observaciones: en mantenimiento son las tareas; en los demás, algo para destacar
export function getAyudaObservaciones(tipo) {
  return tipo === 'MANTENIMIENTO' ? 'Tareas realizadas o a realizar, una por línea' : '¿Algo para destacar?'
}

export const LARGO_NOMBRE = Object.freeze({ min: 2, max: 60 })

// Nombre o apellido del responsable: 'vacio', 'corto', 'largo' u 'ok' (sin contar los espacios de los bordes)
export function validarNombre(valor) {
  const largo = valor.trim().length
  if (largo === 0) return 'vacio'
  if (largo < LARGO_NOMBRE.min) return 'corto'
  if (largo > LARGO_NOMBRE.max) return 'largo'
  return 'ok'
}

/*
 * Fotos de evidencia del checklist. El back acepta de 1 a 4 de hasta 1,5 MB, pero por ahora se pide una sola:
 * la pantalla dibuja MAX_FOTOS lugares, así que para habilitar más alcanza con cambiar este número
 */
export const MAX_FOTOS = 1

// Una foto de celular pesa de 3 a 6 MB: se achica antes de enviarla (lado mayor de 1280 px, JPEG desde calidad 0,7)
export const COMPRESION_FOTO = Object.freeze({
  ladoMayor: 1280,
  calidades: [0.7, 0.6, 0.5],
  pesoObjetivo: 400 * 1024,
})

// Lo que el mecánico va cargando, con la forma que después pide el POST del checklist.
// `respuestas` es { [item.id]: estado }; al enviar se pasa a la lista de { plantilla_item_id, estado }
export const DATOS_CHECKLIST_INICIALES = Object.freeze({
  horas: '',
  respuestas: {},
  observaciones: '',
  nombre: '',
  apellido: '',
})

/*
 * Borrador automático en localStorage, uno por token y tipo: checklist:<token>:<tipo>.
 * Hay uno solo por equipo a la vez: al guardar el de un tipo se borran los de los otros.
 * Las fotos no van (no entran en localStorage): solo `conFotos`, si había alguna, para pedir que las vuelva a sacar
 */
const VERSION_BORRADOR = 1

function claveBorrador(token, tipo) {
  return `checklist:${token}:${tipo}`
}

function leerClave(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave))
  } catch {
    return null
  }
}

function borrarClave(clave) {
  try {
    localStorage.removeItem(clave)
  } catch {
    // Sin acceso a localStorage no hay borrador guardado que borrar
  }
}

/*
 * Borrador más reciente de un equipo, entre los tipos que hoy le ofrece el back. Uno con otra versión o
 * dañado se descarta. Devuelve { tipo, paso, datos, conFotos, actualizadoEn } o null
 */
export function leerBorrador(token, tipos) {
  let elegido = null
  for (const tipo of tipos) {
    const borrador = leerClave(claveBorrador(token, tipo))
    const esValido =
      borrador?.version === VERSION_BORRADOR && borrador.tipo === tipo && typeof borrador.paso === 'string'
    if (!esValido) continue
    if (!elegido || String(borrador.actualizadoEn) > String(elegido.actualizadoEn)) elegido = borrador
  }
  if (!elegido) return null

  const { tipo, paso, datos, conFotos, actualizadoEn } = elegido
  return { tipo, paso, datos: { ...DATOS_CHECKLIST_INICIALES, ...datos }, conFotos: conFotos === true, actualizadoEn }
}

export function guardarBorrador(token, tipos, { tipo, paso, datos, conFotos }) {
  try {
    const borrador = { version: VERSION_BORRADOR, tipo, paso, datos, conFotos, actualizadoEn: new Date().toISOString() }
    localStorage.setItem(claveBorrador(token, tipo), JSON.stringify(borrador))
  } catch {
    // Sin acceso a localStorage (o sin espacio): el checklist sigue, pero sin borrador
  }
  tipos.filter((otro) => otro !== tipo).forEach((otro) => borrarClave(claveBorrador(token, otro)))
}

export function borrarBorradores(token, tipos) {
  tipos.forEach((tipo) => borrarClave(claveBorrador(token, tipo)))
}

/*
 * Responsable recordado en el celular (checklist:responsable): el mismo mecánico usa el mismo celular, así que
 * después de un envío exitoso se guardan su nombre y apellido y se precargan en el próximo checklist, de cualquier equipo
 */
const CLAVE_RESPONSABLE = 'checklist:responsable'

// { nombre, apellido } o null si no hay uno guardado (o no sirve)
export function leerResponsable() {
  const responsable = leerClave(CLAVE_RESPONSABLE)
  const esValido = typeof responsable?.nombre === 'string' && typeof responsable?.apellido === 'string'
  return esValido ? { nombre: responsable.nombre, apellido: responsable.apellido } : null
}

export function guardarResponsable({ nombre, apellido }) {
  try {
    localStorage.setItem(CLAVE_RESPONSABLE, JSON.stringify({ nombre: nombre.trim(), apellido: apellido.trim() }))
  } catch {
    // Sin acceso a localStorage: la próxima vez se vuelve a escribir
  }
}

const hora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const dia = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' })

// Cuándo se tocó el borrador por última vez: "hoy a las 14:32" o "el 28/10 a las 9:05". null si la fecha no sirve
export function formatMomentoBorrador(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const esHoy = date.toDateString() === new Date().toDateString()
  return `${esHoy ? 'hoy' : `el ${dia.format(date)}`} a las ${hora.format(date)}`
}

// Referencia del paso de horas: "2.140 hs (24/10)", sin la fecha si no vino o no sirve. null si nunca se cargaron
export function formatUltimaCargaHoras({ horasMotorActual, horasActualizadasEn }) {
  if (horasMotorActual == null) return null
  const date = new Date(horasActualizadasEn)
  const fecha = horasActualizadasEn && !Number.isNaN(date.getTime()) ? ` (${dia.format(date)})` : ''
  return `${formatHoras(horasMotorActual)} hs${fecha}`
}
