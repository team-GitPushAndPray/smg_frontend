import { cotizacion } from '../data/empresa'
import { getWhatsappUrl } from './vendedores'

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
