const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  console.warn('Falta VITE_API_URL: copiá .env.example a .env y configurá la URL del backend.')
}

export const API_URL = (apiUrl ?? '').replace(/\/+$/, '')
