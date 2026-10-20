/*
 * Nivel de acceso de un rol sobre un módulo. En el back es la presencia del módulo en la lista del rol
 * más `puedeEditar`; en la matriz se muestra como uno de estos tres valores
 */
export const NIVELES = Object.freeze({
  NINGUNO: 'ninguno',
  VER: 'ver',
  EDITAR: 'editar',
})

export function getNivel(modulos, codigo) {
  const modulo = modulos.find((item) => item.codigo === codigo)
  if (!modulo) return NIVELES.NINGUNO
  return modulo.puedeEditar ? NIVELES.EDITAR : NIVELES.VER
}

// Lista completa de módulos del rol con el nivel de `codigo` cambiado: es el body del PUT, que reemplaza todo
export function setNivel(modulos, codigo, nivel) {
  const resto = modulos.filter((item) => item.codigo !== codigo)
  return nivel === NIVELES.NINGUNO ? resto : [...resto, { codigo, puedeEditar: nivel === NIVELES.EDITAR }]
}
