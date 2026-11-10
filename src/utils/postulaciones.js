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
    consentimiento: consentimiento ? undefined : 'Para postularte tenés que aceptar el uso de tus datos.',
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
 * - { mensaje }: cualquier otro caso, para mostrar arriba del botón de enviar.
 * En los 400, Nest manda `message` como lista si falló la validación del DTO y como texto si lo lanzó el servicio
 * (vacante inactiva, PDF inválido): solo el texto se usa para distinguir el motivo
 */
export function getErrorPostulacion(error) {
  if (error.status === 413) {
    return { campo: 'cv', mensaje: `El CV pesa más de ${MAX_CV_MB} MB. Probá con un PDF más liviano.` }
  }
  if (error.status !== 400) return { mensaje: ERROR_GENERICO }

  const message = error.data?.message
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
