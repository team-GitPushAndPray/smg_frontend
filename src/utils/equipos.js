import { Ban, CircleCheck, KeyRound, Wrench } from 'lucide-react'
import { cotizacion } from '../data/empresa'
import { normalizeText } from './text'
import { getErrorGenerico } from './usuarios'
import { getWhatsappUrl } from './vendedores'

/*
 * Estados de un equipo en el panel, con la clave tal cual la manda el back. La paleta no tiene verde ni amarillo:
 * cada estado se distingue por tono e ícono, y siempre se muestra con su texto (nunca solo el color).
 * El orden es el de los selects y filtros
 */
export const ESTADOS_EQUIPO = Object.freeze({
  disponible: {
    label: 'Disponible',
    Icon: CircleCheck,
    className: 'bg-black text-white dark:bg-white dark:text-black',
  },
  alquilado: {
    label: 'Alquilado',
    Icon: KeyRound,
    className: 'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-300',
  },
  en_taller: {
    label: 'En taller',
    Icon: Wrench,
    className: 'bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  },
  fuera_de_servicio: {
    label: 'Fuera de servicio',
    Icon: Ban,
    className: 'bg-brand-600 text-white',
  },
})

/*
 * Configuración del estado de un equipo. El listado manda la clave ("en_taller") y el detalle, la etiqueta
 * ("En taller"): se aceptan las dos. Devuelve null si el front no conoce el estado
 */
export function getEstadoEquipo(estado) {
  if (Object.hasOwn(ESTADOS_EQUIPO, estado)) return ESTADOS_EQUIPO[estado]
  const buscado = normalizeText(estado)
  return Object.values(ESTADOS_EQUIPO).find(({ label }) => normalizeText(label) === buscado) ?? null
}

// Clave del estado de un equipo ("en_taller"), venga como clave o como etiqueta. null si el front no lo conoce
export function getClaveEstado(estado) {
  const config = getEstadoEquipo(estado)
  return Object.keys(ESTADOS_EQUIPO).find((clave) => ESTADOS_EQUIPO[clave] === config) ?? null
}

// Tipos de equipo, con la clave que acepta el filtro `tipo` del back
export const TIPOS_EQUIPO = Object.freeze({
  maquina: 'Máquina',
  aditamento: 'Aditamento',
})

const horas = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })

// Número de horas con separador de miles ("3.950"), sin la unidad
export function formatHoras(valor) {
  return horas.format(valor)
}
const fechaCorta = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// Dato de una máquina que el back manda en null porque nunca se cargó
export const SIN_REGISTRAR = 'Sin registrar'

// Horas de motor de una máquina ("3.950 h"). Los aditamentos no tienen motor: "—"
export function formatHorasMotor(equipo) {
  if (equipo.tipo !== 'maquina') return '—'
  if (equipo.horasMotorActual == null) return SIN_REGISTRAR
  return `${horas.format(equipo.horasMotorActual)} h`
}

// Fecha de la última carga de horas ("14/10/2026"). "—" en aditamentos y "Sin registrar" si nunca se cargaron
export function formatHorasActualizadas(equipo) {
  if (equipo.tipo !== 'maquina') return '—'
  if (!equipo.horasActualizadasEn) return SIN_REGISTRAR
  const date = new Date(equipo.horasActualizadasEn)
  return Number.isNaN(date.getTime()) ? SIN_REGISTRAR : fechaCorta.format(date)
}

// El "nombre" de un equipo es el de su categoría
export function getNombreEquipo(equipo) {
  return equipo.nombre ?? equipo.categoria?.nombre ?? 'Sin categoría'
}

const texto = (valor) => valor?.trim() ?? ''

// Datos guardados de un equipo con los nombres y tipos que manda EquipoForm, para compararlos
function getDatosGuardados(equipo) {
  return {
    codigoInterno: texto(equipo.codigoInterno),
    categoriaId: equipo.categoria?.id != null ? Number(equipo.categoria.id) : null,
    marca: texto(equipo.marca),
    ubicacion: texto(equipo.ubicacion),
    descripcion: texto(equipo.descripcion),
    modelo: texto(equipo.modelo),
    anio: equipo.anio != null ? Number(equipo.anio) : null,
    nSerie: texto(equipo.nSerie),
  }
}

/*
 * Body del PATCH de un equipo: solo los campos de `datos` (lo que manda EquipoForm) que difieren de lo guardado.
 * El tipo no se edita, así que nunca viaja; en un aditamento los campos de máquina ni siquiera llegan.
 * El código interno se guarda en mayúsculas: cambiar solo mayúsculas/minúsculas no cuenta como cambio
 */
export function getCambiosEquipo(equipo, datos) {
  const guardados = getDatosGuardados(equipo)
  const cambios = {}
  for (const [campo, valor] of Object.entries(datos)) {
    if (campo === 'tipo') continue
    const igual =
      campo === 'codigoInterno' ? valor.toUpperCase() === guardados.codigoInterno.toUpperCase() : valor === guardados[campo]
    if (!igual) cambios[campo] = valor
  }
  return cambios
}

const EQUIPO_INEXISTENTE = 'El equipo no existe'

/*
 * Mensaje para el usuario ante un error del módulo máquinas. Devuelve null en 401 (apiFetch cierra la sesión
 * y <RutaPrivada> lleva al login) y en 403 (apiFetch ya mostró el aviso de permisos).
 * En un 400 el back puede mandar una lista de validaciones: se muestran todas
 */
export function getErrorEquipo(error) {
  if (error.status === 400) {
    const mensajes = error.data?.message
    return Array.isArray(mensajes) ? mensajes.join('. ') : error.message
  }
  if (error.status === 404) return EQUIPO_INEXISTENTE
  if (error.status === 409) return error.message
  return getErrorGenerico(error)
}

/*
 * Datos de un equipo del catálogo listos para mostrar: tipo, marca, modelo y descripción.
 * El modelo sale de la máquina o, si es un aditamento, del aditamento.
 * `nombre` junta tipo, marca y modelo para los mensajes ("Excavadora Komatsu PC210LC-10").
 */
export function describeEquipo(equipo) {
  const tipo = equipo.categoria?.nombre ?? 'Sin categoría'
  const marca = equipo.marca ?? ''
  const modelo = equipo.maquina?.modelo ?? equipo.aditamento?.modelo ?? ''

  return {
    tipo,
    marca,
    modelo,
    nombre: [tipo, marca, modelo].filter(Boolean).join(' '),
    descripcion: equipo.descripcion?.trim() ?? '',
    esAditamento: !equipo.maquina && Boolean(equipo.aditamento),
  }
}

// WhatsApp de cotizaciones con el equipo ya escrito en el mensaje
export function getCotizacionUrl(nombre) {
  return getWhatsappUrl(cotizacion.whatsapp, `${cotizacion.mensaje} ${nombre}`)
}

// Categorías presentes en el listado, con la cantidad de equipos de cada una, ordenadas por nombre
export function getCategorias(equipos) {
  const categorias = new Map()

  for (const equipo of equipos) {
    if (!equipo.categoria) continue
    const { id, nombre } = equipo.categoria
    const actual = categorias.get(id)
    categorias.set(id, { id, nombre, cantidad: (actual?.cantidad ?? 0) + 1 })
  }

  return [...categorias.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}
