import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'

/*
 * Requiere sesión para todo el panel (menos el login). Es experiencia de usuario, no seguridad:
 * la API igual responde 401/403 si alguien fuerza una URL o una request.
 * Sin sesión lleva al login guardando la sección de origen, para volver ahí después de ingresar.
 * Si la sesión terminó por "Cerrar sesión", no se guarda: al volver a ingresar se arranca en Inicio.
 */
export default function RutaPrivada({ children }) {
  const { usuario, cargando, cerroSesion, verificarSesion } = useAuth()
  const { pathname, search, hash } = useLocation()
  // Si al entrar al panel ya había sesión (o se estaba restaurando), un logout posterior pasó acá adentro.
  // Si se entra sin sesión (por ejemplo escribiendo la URL después de un logout), siempre se guarda el origen
  const [entroConSesion] = useState(() => Boolean(usuario) || cargando)

  // En cada cambio de sección se confirma que el token siga guardado
  useEffect(() => {
    verificarSesion()
  }, [pathname, verificarSesion])

  // Mientras se restaura la sesión no se redirige: si no, al recargar la página se vería el login un instante
  if (cargando) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <p
          role="status"
          className="glass flex items-center gap-2.5 px-5 py-3.5 text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />
          Verificando sesión…
        </p>
      </div>
    )
  }

  if (!usuario) {
    const guardarOrigen = !(entroConSesion && cerroSesion)
    return (
      <Navigate to="/admin/login" replace state={guardarOrigen ? { from: { pathname, search, hash } } : undefined} />
    )
  }

  return children
}
