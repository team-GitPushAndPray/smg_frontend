import { ClipboardCheck, KeyRound, Wrench } from 'lucide-react'
import { getIconoChecklist } from './checklists'
import { formatHoras } from './equipos'

/*
 * Pestañas del historial de un equipo (/admin/maquinas/:id/historial?tab=checklists). `id` es el valor que va en la
 * URL; `pendiente` es el módulo del que dependen sus datos mientras no exista (se muestra un estado vacío)
 */
export const PESTANAS_HISTORIAL = Object.freeze([
  { id: 'checklists', label: 'Checklists', Icon: ClipboardCheck },
  { id: 'alquileres', label: 'Alquileres', Icon: KeyRound, pendiente: 'Alquileres' },
  { id: 'mantenimiento', label: 'Mantenimiento', Icon: Wrench, pendiente: 'Taller' },
])

// Nombre del parámetro de la URL con la pestaña activa
export const PARAM_PESTANA = 'tab'

// Pestaña de la URL; si no vino o no existe, la primera (Checklists)
export function getPestanaHistorial(valor) {
  return PESTANAS_HISTORIAL.find(({ id }) => id === valor) ?? PESTANAS_HISTORIAL[0]
}

// Checklists por página del historial
export const CHECKLISTS_POR_PAGINA = 20

// Checklists por pedido al exportar a PDF: el máximo que acepta el back, para recorrer todo con los menos pedidos
export const CHECKLISTS_POR_PEDIDO_EXPORTACION = 100

/*
 * Tipos de checklist del historial, con la clave del back y el mismo nombre que ve el mecánico al elegirlo.
 * La paleta no tiene más colores: cada tipo se distingue por tono, ícono y texto. El rojo sólido queda para los
 * anormales, que es lo que tiene que saltar a la vista. El orden es el del filtro
 */
export const TIPOS_CHECKLIST = Object.freeze({
  DIARIO: {
    label: 'Revisión diaria',
    className: 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300',
  },
  MANTENIMIENTO: {
    label: 'Mantenimiento',
    className: 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  },
  ENTREGA: {
    label: 'Entrega',
    className: 'bg-black text-white dark:bg-white dark:text-black',
  },
  DEVOLUCION: {
    label: 'Devolución',
    className: 'border border-neutral-400 text-neutral-800 dark:border-neutral-500 dark:text-neutral-200',
  },
})

const TIPO_DESCONOCIDO = 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300'

// Etiqueta, ícono y color de un tipo. Uno que el front no conoce se muestra tal cual, en gris
export function getTipoChecklist(tipo) {
  const config = TIPOS_CHECKLIST[tipo]
  return {
    label: config?.label ?? (tipo || 'Sin tipo'),
    className: config?.className ?? TIPO_DESCONOCIDO,
    Icon: getIconoChecklist(tipo),
  }
}

// Un checklist del listado del historial con los nombres del front
export function adaptarChecklistHistorial(row) {
  return {
    id: row?.id,
    tipo: row?.tipo ?? null,
    fecha: row?.fecha ?? null,
    horasMotor: row?.horas_motor ?? null,
    responsable: getResponsable(row),
    anormales: row?.cantidad_anormales ?? 0,
    fotos: row?.cantidad_fotos ?? 0,
    tieneObservaciones: row?.tiene_observaciones === true,
  }
}

// Nombre y apellido del responsable en una línea; '' si no vino ninguno
function getResponsable(row) {
  return [row?.responsable_nombre, row?.responsable_apellido]
    .map((parte) => parte?.trim())
    .filter(Boolean)
    .join(' ')
}

// Texto libre que puede venir null o con solo espacios: '' si no tiene nada que mostrar
function getTexto(valor) {
  return typeof valor === 'string' ? valor.trim() : ''
}

/*
 * Detalle de un checklist (GET /equipos/:id/historial/checklists/:checklistId) con los nombres del front.
 * Las respuestas llegan en el orden de la plantilla; las fotos, en el orden en que se cargaron
 */
export function adaptarDetalleChecklist(data) {
  const respuestas = Array.isArray(data?.respuestas) ? data.respuestas : []
  const fotos = Array.isArray(data?.fotos) ? data.fotos : []
  return {
    id: data?.id,
    tipo: data?.tipo ?? null,
    fecha: data?.fecha ?? null,
    horasMotor: data?.horas_motor ?? null,
    responsable: getResponsable(data),
    observaciones: getTexto(data?.observaciones),
    respuestas: respuestas.map((respuesta, index) => ({
      id: `${respuesta?.orden ?? 'x'}-${index}`,
      item: respuesta?.item?.trim() || 'Ítem sin nombre',
      estado: respuesta?.estado ?? null,
      observacion: getTexto(respuesta?.observacion),
    })),
    fotos: fotos.filter((foto) => typeof foto?.url === 'string' && foto.url).map(({ id, url }) => ({ id, url })),
  }
}

/*
 * Respuestas del detalle separadas: las ANORMAL, que son lo que hay que mirar, y el resto (NORMAL, NO_APLICA o un
 * estado que el front no conoce). Las dos conservan el orden de la plantilla, el mismo de la hoja en papel
 */
export function separarRespuestas(respuestas) {
  const anormales = []
  const resto = []
  for (const respuesta of respuestas) {
    if (respuesta.estado === 'ANORMAL') anormales.push(respuesta)
    else resto.push(respuesta)
  }
  return { anormales, resto }
}

/*
 * Transformaciones de Cloudinary para las fotos de un checklist: la miniatura de la galería (cuadrada, recortada al
 * centro, al doble de su tamaño en pantalla para que se vea nítida en pantallas de alta densidad) y la del visor
 * (hasta 1600px de ancho, sin recortar ni agrandar). f_auto y q_auto eligen formato y calidad según el navegador
 */
export const TRANSFORMACION_FOTO = Object.freeze({
  miniatura: 'w_300,h_300,c_fill,g_auto,f_auto,q_auto',
  ampliada: 'w_1600,c_limit,f_auto,q_auto',
  // Para imprimir: dos por fila en A4 (~9 cm de ancho), nítidas en papel sin pedir la original
  impresion: 'w_1000,c_limit,f_auto,q_auto',
})

/*
 * URL de una foto de Cloudinary con una transformación ("…/image/upload/<transformación>/v123/…").
 * Una URL que no es de Cloudinary vuelve tal cual: se ve igual, solo que sin achicar
 */
export function getUrlFoto(url, transformacion) {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${transformacion}/`)
}

/*
 * Horas de motor del checklist ("2.148 h"). Los aditamentos no tienen motor: "—", igual que si no vinieron.
 * `esMaquina` sale del equipo del historial, no del checklist
 */
export function formatHorasChecklist(horas, esMaquina) {
  return esMaquina && horas != null ? `${formatHoras(horas)} h` : '—'
}

const fechaCorta = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const horaCorta = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

// Cuándo se cargó: { fecha: "05/11/2026", hora: "14:32" }, en la hora del navegador. null si la fecha no sirve
export function formatFechaChecklist(iso) {
  const date = new Date(iso)
  if (!iso || Number.isNaN(date.getTime())) return null
  return { fecha: fechaCorta.format(date), hora: horaCorta.format(date) }
}

// Cantidad con su sustantivo: "1 anormal", "3 fotos"
export function contar(cantidad, { one, other }) {
  return `${cantidad} ${cantidad === 1 ? one : other}`
}

/*
 * Fecha del filtro tal cual la manda un <input type="date"> y la espera el back: YYYY-MM-DD de un día que existe.
 * Un año menor a 1900 es uno a medio tipear ("0020-…"), no una fecha
 */
export function esFechaFiltro(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor ?? '')) return false
  const [anio, mes, dia] = valor.split('-').map(Number)
  const date = new Date(Date.UTC(anio, mes - 1, dia))
  const existe = date.getUTCFullYear() === anio && date.getUTCMonth() === mes - 1 && date.getUTCDate() === dia
  return existe && anio >= 1900
}

// Una fecha en la zona del navegador como YYYY-MM-DD
function toFechaIso(date) {
  const dosCifras = (valor) => String(valor).padStart(2, '0')
  return `${date.getFullYear()}-${dosCifras(date.getMonth() + 1)}-${dosCifras(date.getDate())}`
}

// Hoy en la zona del navegador, como YYYY-MM-DD: tope de los filtros de fecha (no hay checklists del futuro)
export function getHoyFiltro() {
  return toFechaIso(new Date())
}

// Fecha de un filtro (YYYY-MM-DD) como se lee: "01/10/2026". Se arma a mano para no correrla de día por la zona
function formatFechaFiltro(valor) {
  const [anio, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${anio}`
}

/*
 * Filtros aplicados al listado, en palabras, para el encabezado del PDF: [{ label: 'Tipo', valor: 'Entrega' }, …].
 * Vacío si no hay ninguno. Un rango con un solo extremo se lee "Desde 01/10/2026" o "Hasta 31/10/2026"
 */
export function describirFiltros({ desde, hasta, tipo, responsable, q }) {
  const filtros = []
  if (tipo) filtros.push({ label: 'Tipo', valor: getTipoChecklist(tipo).label })
  if (desde && hasta) {
    filtros.push({ label: 'Fechas', valor: `${formatFechaFiltro(desde)} al ${formatFechaFiltro(hasta)}` })
  } else if (desde) {
    filtros.push({ label: 'Fechas', valor: `Desde ${formatFechaFiltro(desde)}` })
  } else if (hasta) {
    filtros.push({ label: 'Fechas', valor: `Hasta ${formatFechaFiltro(hasta)}` })
  }
  if (responsable) filtros.push({ label: 'Responsable contiene', valor: `“${responsable}”` })
  if (q) filtros.push({ label: 'Observaciones contienen', valor: `“${q}”` })
  return filtros
}

/*
 * Título del documento mientras se imprime: el navegador lo propone como nombre del PDF
 * ("Historial de checklists M027 2026-11-05"). Sin caracteres que un sistema de archivos rechace
 */
export function getNombreArchivo(partes, fecha) {
  const nombre = [...partes, fecha && !Number.isNaN(new Date(fecha).getTime()) ? toFechaIso(new Date(fecha)) : null]
    .map((parte) => (typeof parte === 'string' ? parte.trim() : parte))
    .filter(Boolean)
    .join(' ')
  return nombre.replace(/[\\/:*?"<>|]+/g, '-')
}
