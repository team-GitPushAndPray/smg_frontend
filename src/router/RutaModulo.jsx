import { useAuth } from '../hooks/useAuth'
import ForbiddenPage from '../pages/admin/ForbiddenPage'

/*
 * Requiere que el rol del usuario tenga el módulo (con cualquier nivel); con `requiereEdicion`, además, que pueda
 * editarlo (pantallas de alta y edición). Si no, muestra la 403 dentro del panel
 */
export default function RutaModulo({ modulo, requiereEdicion = false, children }) {
  const { tieneModulo, puedeEditar } = useAuth()
  if (!tieneModulo(modulo)) return <ForbiddenPage />
  if (requiereEdicion && !puedeEditar(modulo)) {
    return <ForbiddenPage description="Tu rol puede ver este módulo, pero no modificarlo. Si lo necesitás, consultá con un administrador." />
  }
  return children
}
