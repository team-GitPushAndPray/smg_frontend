import { useAuth } from '../hooks/useAuth'
import ForbiddenPage from '../pages/admin/ForbiddenPage'

// Requiere que el rol del usuario tenga el módulo (con cualquier nivel). Si no, muestra la 403 dentro del panel
export default function RutaModulo({ modulo, children }) {
  const { tieneModulo } = useAuth()
  return tieneModulo(modulo) ? children : <ForbiddenPage />
}
