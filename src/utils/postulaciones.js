import { formatFechaChecklist } from './historial'
import { getErrorGenerico } from './usuarios'

/** @import { EstadoPostulacion, OrdenPostulaciones, Postulacion } from '../types/postulaciones' */

/*
 * Reglas del formulario de postulación ("Trabajá con nosotros"), espejo de las del back.
 * El tamaño del CV se valida acá sí o sí: Vercel corta las requests de más de ~4,5 MB antes de llegar al back,
 * y esa respuesta llega sin CORS, así que el navegador la ve como un error de red y no como un 413
 */
export const MAX_CV_MB = 4
const MAX_CV_BYTES = MAX_CV_MB * 1024 * 1024
const TIPO_CV = 'application/pdf'

// Largos máximos del back: se usan en el maxLength de cada campo y en la validación
export const LIMITES = {
  nombre: 100,
  apellido: 100,
  email: 150,
  telefono: 40,
  mensaje: 1500,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// `website` es el honeypot: queda vacío salvo que lo complete un bot
export const POSTULACION_VACIA = { nombre: '', apellido: '', email: '', telefono: '', mensaje: '', website: '' }

// Datos que viajan al back, con trim: un campo con solo espacios cuenta como vacío
export function getDatosPostulacion(values) {
  return {
    nombre: values.nombre.trim(),
    apellido: values.apellido.trim(),
    email: values.email.trim(),
    telefono: values.telefono.trim(),
    mensaje: values.mensaje.trim(),
  }
}

// El tipo se chequea por el MIME del navegador; la verificación real (que empiece con %PDF) la hace el back
export function validarCv(file) {
  if (!file) return 'Adjuntá tu CV en PDF.'
  if (file.type !== TIPO_CV) return 'El CV tiene que ser un archivo PDF.'
  if (file.size === 0) return 'El archivo está vacío. Elegí otro PDF.'
  if (file.size > MAX_CV_BYTES) return `El CV pesa más de ${MAX_CV_MB} MB. Probá con un PDF más liviano.`
  return undefined
}

function validarTexto(valor, { requerido, maximo, vacio, largo }) {
  if (!valor) return requerido ? vacio : undefined
  if (valor.length > maximo) return largo
  return undefined
}

const MENSAJE_CONSENTIMIENTO = 'Para postularte tenés que aceptar el uso de tus datos.'

/*
 * Errores por campo, en el orden en que aparecen en el formulario (el foco va al primero).
 * `datos` ya viene con trim (getDatosPostulacion)
 */
export function validarPostulacion(datos, { cv, consentimiento }) {
  const errors = {
    nombre: validarTexto(datos.nombre, {
      requerido: true,
      maximo: LIMITES.nombre,
      vacio: 'Ingresá tu nombre.',
      largo: `El nombre puede tener hasta ${LIMITES.nombre} caracteres.`,
    }),
    apellido: validarTexto(datos.apellido, {
      requerido: true,
      maximo: LIMITES.apellido,
      vacio: 'Ingresá tu apellido.',
      largo: `El apellido puede tener hasta ${LIMITES.apellido} caracteres.`,
    }),
    email:
      validarTexto(datos.email, {
        requerido: true,
        maximo: LIMITES.email,
        vacio: 'Ingresá tu email.',
        largo: `El email puede tener hasta ${LIMITES.email} caracteres.`,
      }) ?? (EMAIL_PATTERN.test(datos.email) ? undefined : 'Ingresá un email válido, por ejemplo nombre@gmail.com.'),
    telefono: validarTexto(datos.telefono, {
      requerido: true,
      maximo: LIMITES.telefono,
      vacio: 'Ingresá un teléfono de contacto.',
      largo: `El teléfono puede tener hasta ${LIMITES.telefono} caracteres.`,
    }),
    mensaje: validarTexto(datos.mensaje, {
      requerido: false,
      maximo: LIMITES.mensaje,
      largo: `El mensaje puede tener hasta ${LIMITES.mensaje} caracteres.`,
    }),
    cv: validarCv(cv),
    consentimiento: consentimiento ? undefined : MENSAJE_CONSENTIMIENTO,
  }
  return Object.fromEntries(Object.entries(errors).filter(([, error]) => error))
}

/*
 * Peso del archivo para mostrar junto al nombre: "320 KB", "1,4 MB". Se redondea para arriba, así un archivo apenas
 * pasado del límite no se ve como "4 MB" al lado del error de que pesa más de 4 MB
 */
export function formatearPeso(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.ceil(bytes / 1024))} KB`
  const megas = Math.ceil((bytes / (1024 * 1024)) * 10) / 10
  return `${megas.toLocaleString('es-AR', { maximumFractionDigits: 1 })} MB`
}

const ERROR_GENERICO = 'No pudimos enviar tu postulación. Revisá tu conexión e intentá de nuevo en unos minutos.'

/*
 * Traduce el error del envío a un mensaje simple, sin texto técnico del back. Devuelve:
 * - { vacanteCerrada: true }: la vacante ya no está activa (la desactivaron mientras se completaba el formulario).
 * - { campo: 'cv', mensaje }: el CV no pasó la validación del back (no es un PDF real o pesa más de 4 MB).
 * - { campo: 'consentimiento', mensaje }: el back no recibió la aceptación del uso de datos (`acepta_tratamiento`);
 *   el mensaje es el que devuelve el back.
 * - { mensaje }: cualquier otro caso, para mostrar arriba del botón de enviar.
 * En los 400, Nest manda `message` como lista si falló la validación del DTO y como texto si lo lanzó el servicio
 * (vacante inactiva, PDF inválido). El consentimiento se reconoce en la lista; el resto de los motivos, solo en el texto
 */
export function getErrorPostulacion(error) {
  if (error.status === 413) {
    return { campo: 'cv', mensaje: `El CV pesa más de ${MAX_CV_MB} MB. Probá con un PDF más liviano.` }
  }
  if (error.status !== 400) return { mensaje: ERROR_GENERICO }

  const message = error.data?.message
  const mensajes = Array.isArray(message) ? message : [message]
  const consentimiento = mensajes.find(
    (m) => typeof m === 'string' && /aceptar el uso de tus datos|acepta_tratamiento/i.test(m),
  )
  if (consentimiento) {
    // Se muestra el texto del back; si viniera el técnico (con el nombre del campo), el del front
    const mensaje = /acepta_tratamiento/i.test(consentimiento) ? MENSAJE_CONSENTIMIENTO : consentimiento
    return { campo: 'consentimiento', mensaje }
  }
  if (typeof message === 'string') {
    if (/vacante/i.test(message)) return { vacanteCerrada: true }
    if (/pdf|archivo|cv/i.test(message)) {
      return {
        campo: 'cv',
        mensaje: 'No pudimos leer el archivo como PDF. Exportalo de nuevo a PDF y volvé a adjuntarlo.',
      }
    }
  }
  return { mensaje: 'Revisá los datos del formulario e intentá de nuevo.' }
}

/*
 * Estados de una postulación, con la clave tal cual la manda el back y en el orden del proceso. Los usan la bandeja
 * (badge y filtro) y la ficha. La paleta no tiene ámbar ni verde: cada estado se distingue por relleno y tono, siempre
 * con su texto (sin íconos). Nuevo es el que más resalta (rojo sólido: pide atención); En revisión, solo contorno;
 * Contactado, sólido en el color del texto; Descartado, gris apagado
 */
export const ESTADOS_POSTULACION = Object.freeze({
  NUEVO: {
    label: 'Nuevo',
    className: 'bg-brand-600 text-white',
  },
  EN_REVISION: {
    label: 'En revisión',
    className: 'text-neutral-800 ring-1 ring-neutral-500 ring-inset dark:text-neutral-200 dark:ring-neutral-400',
  },
  CONTACTADO: {
    label: 'Contactado',
    className: 'bg-black text-white dark:bg-white dark:text-black',
  },
  DESCARTADO: {
    label: 'Descartado',
    className: 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300',
  },
})

/**
 * Configuración del estado de una postulación, o null si el front no lo conoce
 * @param {EstadoPostulacion | string | null} estado
 */
export function getEstadoPostulacion(estado) {
  return estado && Object.hasOwn(ESTADOS_POSTULACION, estado) ? ESTADOS_POSTULACION[estado] : null
}

// Día en que llegó la postulación ("06/11/2026"), en la hora del navegador. "—" si la fecha no sirve
export function formatFechaPostulacion(iso) {
  return formatFechaChecklist(iso)?.fecha ?? '—'
}

// Nombre y apellido del postulante, como se muestra en la bandeja y en la ficha
export function getNombrePostulante(postulacion) {
  return `${postulacion.nombre} ${postulacion.apellido}`.trim()
}

// Día y hora en que llegó la postulación ("06/11/2026, 14:32"), en la hora del navegador. "—" si la fecha no sirve
export function formatFechaHoraPostulacion(iso) {
  const formateada = formatFechaChecklist(iso)
  return formateada ? `${formateada.fecha}, ${formateada.hora}` : '—'
}

/**
 * Enlace para escribirle al postulante desde el cliente de correo, con el asunto ya cargado
 * ("Postulación a Mecánico de equipos pesados")
 * @param {Postulacion} postulacion
 */
export function getMailtoPostulacion(postulacion) {
  const titulo = postulacion.vacante?.titulo
  const asunto = titulo ? `Postulación a ${titulo}` : 'Postulación'
  return `mailto:${postulacion.email}?subject=${encodeURIComponent(asunto)}`
}

/*
 * Mensaje simple para un cambio de estado que falló (el estado en pantalla vuelve al anterior).
 * null si ya lo avisó apiFetch: 401 cierra la sesión y 403 muestra su propio aviso
 */
export function getErrorEstadoPostulacion(error) {
  if (error.status === 404) return 'Esta postulación ya no existe. Volvé a la bandeja.'
  if (error.status === 400) return 'No pudimos cambiar el estado. Recargá la página e intentá de nuevo.'
  const generico = getErrorGenerico(error)
  return generico && `No pudimos cambiar el estado. ${generico}`
}

/*
 * Orden de la bandeja, con la clave tal cual la espera el back (?orden=). El primero es el de por defecto: no se
 * escribe en la URL. "Mayor afinidad" es el ranking por puntaje y solo tiene sentido dentro de una vacante
 */
export const ORDENES_POSTULACIONES = Object.freeze([
  { id: 'recientes', label: 'Ordenar por: Más recientes' },
  { id: 'afinidad', label: 'Ordenar por: Mayor afinidad' },
])

export const ORDEN_POR_DEFECTO = ORDENES_POSTULACIONES[0].id

/**
 * @param {string | null} orden
 * @returns {orden is OrdenPostulaciones}
 */
export function esOrdenPostulaciones(orden) {
  return ORDENES_POSTULACIONES.some(({ id }) => id === orden)
}

/*
 * Franjas del puntaje de afinidad (0 a 100), de la más alta a la más baja. Siguen la escala del prompt del back
 * (70 a 89: cumple los requisitos centrales; 40 a 69: cumple una parte; 0 a 39: el perfil no está relacionado).
 * Usan el verde y el ámbar de estado de index.css (no son acentos) y gris para la más baja; el número siempre va
 * escrito, así que el color nunca es lo único que informa. ok-700 sobre ok-50 y warn-800 sobre warn-100 pasan AA en
 * claro; ok-300 y warn-300 sobre su tinte, en oscuro
 */
const FRANJAS_AFINIDAD = Object.freeze([
  {
    minimo: 70,
    label: 'Afinidad alta',
    className: 'bg-ok-50 text-ok-700 ring-1 ring-ok-700/20 ring-inset dark:bg-ok-300/15 dark:text-ok-300 dark:ring-ok-300/25',
  },
  {
    minimo: 40,
    label: 'Afinidad media',
    className:
      'bg-warn-100 text-warn-800 ring-1 ring-warn-800/15 ring-inset dark:bg-warn-400/15 dark:text-warn-300 dark:ring-warn-300/25',
  },
  {
    minimo: 0,
    label: 'Afinidad baja',
    className: 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300',
  },
])

/**
 * Cómo se muestra el análisis con IA de una postulación en la bandeja:
 * - { tipo: 'sin-analizar' }: PENDIENTE o sin registro de análisis.
 * - { tipo: 'error', detalle }: ERROR, con el `error_detalle` del back. Gana sobre "desactualizado": no hay puntaje.
 * - { tipo: 'puntaje', puntaje, franja, desactualizado }: COMPLETADO; `desactualizado` (cambiaron los requisitos de la
 *   vacante después del análisis) se muestra junto al puntaje, no lo reemplaza.
 * Un COMPLETADO sin puntaje (no debería pasar) o un estado que el front no conoce se toman como sin analizar
 * @param {Postulacion} postulacion
 */
export function getAfinidad(postulacion) {
  const analisis = postulacion.analisis
  if (analisis?.estado === 'ERROR') return { tipo: 'error', detalle: analisis.error_detalle }
  if (analisis?.estado === 'COMPLETADO' && typeof analisis.puntaje === 'number') {
    const franja = FRANJAS_AFINIDAD.find(({ minimo }) => analisis.puntaje >= minimo) ?? FRANJAS_AFINIDAD.at(-1)
    return { tipo: 'puntaje', puntaje: analisis.puntaje, franja, desactualizado: analisis.desactualizado === true }
  }
  return { tipo: 'sin-analizar' }
}

/**
 * Si "Analizar pendientes" tiene que (volver a) analizarla: sin analizar, con error o con un análisis desactualizado
 * @param {Postulacion} postulacion
 */
export function necesitaAnalisis(postulacion) {
  const afinidad = getAfinidad(postulacion)
  return afinidad.tipo !== 'puntaje' || afinidad.desactualizado
}

// Puestos del ranking que se destacan en la bandeja
export const PUESTOS_DESTACADOS = 3

/*
 * Resultado del lote de "Analizar pendientes" para el aviso final: "15 analizadas · 2 con error". Las que volvieron
 * con error también cuentan como analizadas (se procesaron). Si se canceló, se aclara
 */
export function getResumenAnalisis({ procesadas, conError, cancelado }) {
  const analizadas = `${procesadas} ${procesadas === 1 ? 'analizada' : 'analizadas'}`
  const resumen = conError > 0 ? `${analizadas} · ${conError} con error` : analizadas
  return cancelado ? `Análisis cancelado: ${resumen}` : resumen
}

/*
 * Mensaje simple para cuando no se pudo armar la lista de "Analizar pendientes" (el pedido de las postulaciones de la
 * vacante falló). null si ya lo avisó apiFetch: 401 cierra la sesión y 403 muestra su propio aviso
 */
export function getErrorAnalisisPendientes(error) {
  const generico = getErrorGenerico(error)
  return generico && `No pudimos empezar el análisis. ${generico}`
}
