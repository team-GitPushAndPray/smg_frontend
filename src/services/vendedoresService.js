import { apiFetch } from './api'

/**
 * Equipo comercial público: el back solo devuelve vendedores activos,
 * ya ordenados por cargo (Logística > Ventas > Alquileres > Repuestos).
 */
export async function getVendedores({ signal } = {}) {
  const vendedores = await apiFetch('/vendedores/public', { signal })
  return Array.isArray(vendedores) ? vendedores : []
}
