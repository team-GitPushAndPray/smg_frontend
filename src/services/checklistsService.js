import { adaptarFormularioChecklist, adaptarResultadoChecklist } from '../utils/checklists'
import { apiFetch } from './api'

/*
 * Formulario de checklist de un equipo, por el token de su QR (ruta pública, sin sesión): datos del equipo
 * y las opciones de checklist que le corresponden por QR (Diario y Mantenimiento), con sus ítems. Si el token no es
 * de un equipo activo, el back responde 404 (error.status)
 */
export async function getFormularioChecklist(token, { signal } = {}) {
  const data = await apiFetch(`/public/checklists/${encodeURIComponent(token)}`, { auth: false, signal })
  return adaptarFormularioChecklist(data)
}

/*
 * Envía un checklist terminado (ruta pública, sin sesión): multipart con `datos` (el JSON que arma getDatosEnvio)
 * y las fotos ya comprimidas, todas en el campo `fotos`. Un 400 trae en el message qué dato no sirve (también si el
 * tipo no se puede registrar por QR) y un 409 avisa que el equipo ya tiene horas más nuevas (error.status)
 */
export async function enviarChecklist(token, { datos, fotos }) {
  const body = new FormData()
  body.append('datos', JSON.stringify(datos))
  fotos.forEach((foto) => body.append('fotos', foto))

  const data = await apiFetch(`/public/checklists/${encodeURIComponent(token)}`, { method: 'POST', auth: false, body })
  return adaptarResultadoChecklist(data)
}
