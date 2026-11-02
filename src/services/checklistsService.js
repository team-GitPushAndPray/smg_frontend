import { adaptarFormularioChecklist } from '../utils/checklists'
import { apiFetch } from './api'

/*
 * Formulario de checklist de un equipo, por el token de su QR (ruta pública, sin sesión): datos del equipo
 * y las opciones de checklist que le corresponden, con sus ítems. Si el token no es de un equipo activo,
 * el back responde 404 (error.status)
 */
export async function getFormularioChecklist(token, { signal } = {}) {
  const data = await apiFetch(`/public/checklists/${encodeURIComponent(token)}`, { auth: false, signal })
  return adaptarFormularioChecklist(data)
}
