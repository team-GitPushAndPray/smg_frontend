import { apiFetch } from './api'

// Categorías de equipo (excavadora, retroexcavadora…): opciones del filtro y del formulario de máquinas
export async function listarCategorias({ signal } = {}) {
  const categorias = await apiFetch('/categorias', { signal })
  return Array.isArray(categorias) ? categorias : []
}
