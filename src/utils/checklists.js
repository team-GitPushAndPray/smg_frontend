import { ClipboardCheck, ClipboardList, Truck, Undo2, Wrench } from 'lucide-react'
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

// Lo que el mecánico va cargando, con la forma que después pide el POST del checklist
export const DATOS_CHECKLIST_INICIALES = Object.freeze({
  horas: '',
  respuestas: {},
  observaciones: '',
  nombre: '',
  apellido: '',
})

/*
 * Borrador automático en localStorage, uno por token y tipo: checklist:<token>:<tipo>.
 * Hay uno solo por equipo a la vez: al guardar el de un tipo se borran los de los otros
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
 * dañado se descarta. Devuelve { tipo, paso, datos, actualizadoEn } o null
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

  const { tipo, paso, datos, actualizadoEn } = elegido
  return { tipo, paso, datos: { ...DATOS_CHECKLIST_INICIALES, ...datos }, actualizadoEn }
}

export function guardarBorrador(token, tipos, { tipo, paso, datos }) {
  try {
    const borrador = { version: VERSION_BORRADOR, tipo, paso, datos, actualizadoEn: new Date().toISOString() }
    localStorage.setItem(claveBorrador(token, tipo), JSON.stringify(borrador))
  } catch {
    // Sin acceso a localStorage (o sin espacio): el checklist sigue, pero sin borrador
  }
  tipos.filter((otro) => otro !== tipo).forEach((otro) => borrarClave(claveBorrador(token, otro)))
}

export function borrarBorradores(token, tipos) {
  tipos.forEach((tipo) => borrarClave(claveBorrador(token, tipo)))
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
