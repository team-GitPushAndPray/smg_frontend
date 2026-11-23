import { CircleAlert, CircleCheck, Layers, Mail, MessageCircle, Send } from 'lucide-react'
import { ICONOS_TIPO_AVISO } from './avisos'
import { getErrorGenerico } from './usuarios'

/** @import { TipoAviso } from '../types/avisos' */
/**
 * @import {
 *   CanalNotificacion,
 *   EstadoEnvio,
 *   RegistroNotificacion,
 *   ReglaNotificacion,
 *   ReglaNotificacionDatos,
 * } from '../types/notificaciones'
 */

/*
 * Canales del selector de la regla, en este orden. `disponible: false` se muestra deshabilitado con "No disponible" y
 * no viaja nunca al back (WhatsApp todavía no existe). `destino` es el label y el placeholder del campo, que cambian
 * según el canal; `inputProps`, el teclado que conviene en celular (el chat_id puede llevar un "-" adelante, así que
 * no va el teclado numérico, que en iOS no lo tiene)
 */
export const CANALES_NOTIFICACION = Object.freeze([
  {
    id: /** @type {CanalNotificacion} */ ('TELEGRAM'),
    label: 'Telegram',
    Icon: Send,
    disponible: true,
    destino: {
      label: 'chat_id del grupo',
      placeholder: 'Ej.: -1001234567890',
      hint: 'El número del grupo de Telegram. Los grupos suelen empezar con -100.',
      inputProps: { type: 'text', inputMode: 'text', autoCapitalize: 'off', spellCheck: false },
    },
  },
  {
    id: /** @type {CanalNotificacion} */ ('EMAIL'),
    label: 'Email',
    Icon: Mail,
    disponible: true,
    destino: {
      label: 'Dirección de correo',
      placeholder: 'Ej.: taller@empresa.com',
      hint: null,
      inputProps: { type: 'email', inputMode: 'email', autoCapitalize: 'off', spellCheck: false },
    },
  },
  { id: 'WHATSAPP', label: 'WhatsApp', Icon: MessageCircle, disponible: false, destino: null },
])

const CANAL_DESCONOCIDO = { label: 'Desconocido', Icon: MessageCircle }

// Nombre e ícono de un canal que llegó del back, para la tabla
export function getCanalNotificacion(canal) {
  return CANALES_NOTIFICACION.find(({ id }) => id === canal) ?? { ...CANAL_DESCONOCIDO, label: canal || '—' }
}

/*
 * Qué recibe una regla: un tipo de aviso. `label` va en plural, como se lee en la columna "Recibe" y en los checkboxes
 * del alta. El orden es el de las opciones del formulario
 */
export const TIPOS_AVISO_REGLA = Object.freeze([
  { id: /** @type {TipoAviso} */ ('SERVICIO'), label: 'Services', Icon: ICONOS_TIPO_AVISO.SERVICIO },
  { id: /** @type {TipoAviso} */ ('CERTIFICACION'), label: 'Certificaciones', Icon: ICONOS_TIPO_AVISO.CERTIFICACION },
])

export function getTipoAvisoRegla(tipo) {
  return TIPOS_AVISO_REGLA.find(({ id }) => id === tipo) ?? { id: tipo, label: tipo || '—', Icon: null }
}

// Largo máximo de la etiqueta: el mismo que valida el back
export const MAX_ETIQUETA_REGLA = 60

// Las mismas reglas que el back (validarDestinoSegunCanal): Telegram, un entero que puede ser negativo
const CHAT_ID = /^-?\d+$/
// Una sola @, sin espacios y con un dominio que tenga punto. El back (isEmail) es un poco más estricto: lo que se
// escape de acá vuelve como 400 y se muestra en el formulario
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

/**
 * Valores del formulario de una regla. `tipos` son los avisos marcados: en el alta pueden ser los dos (se crea una
 * regla por tipo); en la edición, siempre uno
 * @typedef {{ canal: CanalNotificacion, destino: string, etiqueta: string, tipos: TipoAviso[] }} ReglaFormValues
 */

/**
 * Valores iniciales del formulario: los de la regla al editar, o un alta por Telegram sin nada marcado
 * @param {ReglaNotificacion | null} regla
 * @returns {ReglaFormValues}
 */
export function getValoresRegla(regla) {
  if (!regla) return { canal: 'TELEGRAM', destino: '', etiqueta: '', tipos: [] }
  return { canal: regla.canal, destino: regla.destino, etiqueta: regla.etiqueta, tipos: [regla.tipo_aviso] }
}

/**
 * Errores por campo, en el orden del formulario (el foco va al primero). Valida con trim, como el back
 * @param {ReglaFormValues} values
 * @returns {Partial<Record<'destino' | 'etiqueta' | 'tipos', string>>}
 */
export function validarRegla({ canal, destino, etiqueta, tipos }) {
  const errors = {}
  const destinoLimpio = destino.trim()
  const etiquetaLimpia = etiqueta.trim()

  if (canal === 'TELEGRAM') {
    if (!destinoLimpio) errors.destino = 'Ingresá el chat_id del grupo.'
    else if (!CHAT_ID.test(destinoLimpio)) {
      errors.destino = 'El chat_id tiene que ser un número entero, sin letras ni espacios (puede empezar con -).'
    }
  } else if (canal === 'EMAIL') {
    if (!destinoLimpio) errors.destino = 'Ingresá la dirección de correo.'
    else if (!EMAIL.test(destinoLimpio)) errors.destino = 'Ingresá una dirección de correo válida, como taller@empresa.com.'
  }

  if (!etiquetaLimpia) errors.etiqueta = 'Poné una etiqueta para reconocer la regla, como «Grupo Taller».'
  else if (etiquetaLimpia.length > MAX_ETIQUETA_REGLA) {
    errors.etiqueta = `La etiqueta puede tener hasta ${MAX_ETIQUETA_REGLA} caracteres.`
  }

  if (tipos.length === 0) errors.tipos = 'Elegí al menos un tipo de aviso.'

  return errors
}

/**
 * Body de cada POST del alta: una regla por tipo marcado, todas con el mismo canal, destino y etiqueta
 * @param {ReglaFormValues} values
 * @returns {ReglaNotificacionDatos[]}
 */
export function getAltasRegla({ canal, destino, etiqueta, tipos }) {
  return tipos.map((tipo) => ({ tipo_aviso: tipo, canal, destino: destino.trim(), etiqueta: etiqueta.trim() }))
}

/**
 * Body del PATCH al editar: solo lo que cambió (vacío si no cambió nada)
 * @param {ReglaFormValues} values
 * @param {ReglaNotificacion} regla
 */
export function getCambiosRegla({ canal, destino, etiqueta, tipos }, regla) {
  const datos = { tipo_aviso: tipos[0], canal, destino: destino.trim(), etiqueta: etiqueta.trim() }
  return Object.fromEntries(Object.entries(datos).filter(([campo, valor]) => valor !== regla[campo]))
}

export const REGLA_INEXISTENTE = 'Esta regla ya no existe. Actualizamos la lista.'

/**
 * Mensaje de un 400 del back al guardar una regla: la validación del DTO lo manda como lista y la del servicio
 * (destino que no corresponde al canal) como texto
 * @param {{ message?: string, data?: any }} error
 */
export function getErrorValidacionRegla(error) {
  const mensajes = error.data?.message
  return Array.isArray(mensajes) ? mensajes.join('. ') : error.message
}

/**
 * Mensaje para el aviso rojo cuando falla "Enviar prueba". Un 400 trae el detalle del canal (lo que respondió
 * Telegram o el servidor de correo), que es justo lo que sirve para corregir el destino. null en 401 y 403, que ya
 * avisó apiFetch
 * @param {{ status?: number, message?: string }} error
 * @returns {string | null}
 */
export function getErrorPrueba(error) {
  if (error.status === 400) return `No se pudo enviar la prueba: ${error.message}`
  return getErrorGenerico(error)
}

// Registro de envíos: cuántos se ven por página (el back acepta hasta 100)
export const ENVIOS_POR_PAGINA = 20

/*
 * Filtro por estado del registro. La clave es el valor de la URL (?envio=error); `estado`, lo que viaja a
 * GET /notificaciones/registro (sin él, todos). `Icon` y `tono` son los del menú desplegable (y de la pastilla cuando
 * el filtro está aplicado). El orden es el del menú; el primero es el de por defecto
 */
export const FILTROS_ESTADO_ENVIO = Object.freeze({
  todos: { label: 'Todos los estados', estado: undefined, Icon: Layers, tono: null },
  enviado: { label: 'Enviado', estado: /** @type {EstadoEnvio} */ ('ENVIADO'), Icon: CircleCheck, tono: 'ok' },
  error: { label: 'Error', estado: /** @type {EstadoEnvio} */ ('ERROR'), Icon: CircleAlert, tono: 'error' },
})

// Filtro por canal del registro (?canal=telegram), igual que el de estado. Solo los canales que existen en el back
export const FILTROS_CANAL_ENVIO = Object.freeze({
  todos: { label: 'Todos los canales', canal: undefined, Icon: Layers, tono: null },
  telegram: { label: 'Telegram', canal: /** @type {CanalNotificacion} */ ('TELEGRAM'), Icon: Send, tono: null },
  email: { label: 'Email', canal: /** @type {CanalNotificacion} */ ('EMAIL'), Icon: Mail, tono: null },
})

// Qué aviso disparó el envío, en singular (en la regla va en plural: "Recibe Services")
const TIPOS_AVISO_ENVIO = Object.freeze({
  SERVICIO: { label: 'Service', Icon: ICONOS_TIPO_AVISO.SERVICIO },
  CERTIFICACION: { label: 'Certificación', Icon: ICONOS_TIPO_AVISO.CERTIFICACION },
})

export function getTipoAvisoEnvio(tipo) {
  return TIPOS_AVISO_ENVIO[tipo] ?? { label: tipo || '—', Icon: null }
}

/*
 * Los envíos se guardan en UTC y se muestran siempre en hora de Argentina, se mire desde donde se mire: es la hora en
 * que el taller recibió el aviso. Sin horario de verano (UTC−3 todo el año)
 */
const fechaHoraArgentina = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/**
 * Un timestamp del back en hora de Argentina: "23/11/2026 14:05". Se arma con las partes, porque el separador que
 * pone Intl entre fecha y hora cambia según el navegador. "—" si no vino o no es una fecha
 * @param {string | null | undefined} iso
 * @returns {string}
 */
export function formatFechaHoraArgentina(iso) {
  const date = new Date(iso)
  if (!iso || Number.isNaN(date.getTime())) return '—'
  const partes = Object.fromEntries(fechaHoraArgentina.formatToParts(date).map(({ type, value }) => [type, value]))
  return `${partes.day}/${partes.month}/${partes.year} ${partes.hour}:${partes.minute}`
}

/**
 * A quién se le mandó: la etiqueta de la regla ("Grupo Taller") o, si la regla ya no existe o no tiene, el chat_id o
 * el mail tal cual
 * @param {RegistroNotificacion} envio
 */
export function getDestinoEnvio(envio) {
  return envio.regla_etiqueta?.trim() || envio.destino || '—'
}

/**
 * La máquina del aviso: el código y, aparte, el nombre (marca y modelo), que puede no venir
 * @param {RegistroNotificacion} envio
 * @returns {{ codigo: string, nombre: string | null }}
 */
export function getMaquinaEnvio(envio) {
  return { codigo: envio.maquina?.codigo || '—', nombre: envio.maquina?.nombre?.trim() || null }
}
