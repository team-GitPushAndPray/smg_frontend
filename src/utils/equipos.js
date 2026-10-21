import { Ban, CircleCheck, KeyRound, Wrench } from 'lucide-react'
import { cotizacion } from '../data/empresa'
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
