/*
 * Datos de un equipo del catálogo listos para mostrar: tipo, marca y modelo.
 * El modelo sale de la máquina o, si es un aditamento, del aditamento.
 */
export function describeEquipo(equipo) {
  return {
    tipo: equipo.categoria?.nombre ?? 'Sin categoría',
    marca: equipo.marca ?? '',
    modelo: equipo.maquina?.modelo ?? equipo.aditamento?.modelo ?? '',
    esAditamento: !equipo.maquina && Boolean(equipo.aditamento),
  }
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
