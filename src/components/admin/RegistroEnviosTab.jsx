import { History } from 'lucide-react'
import PanelMessage from './PanelMessage'

/*
 * Sección Registro de envíos de /admin/avisos: cada mensaje que salió (o intentó salir) por una regla de notificación.
 * Por ahora es un lugar reservado: el listado (GET /notificaciones/registro, listarRegistro en notificacionesService)
 * se arma en su propia issue
 */
export default function RegistroEnviosTab() {
  return (
    <PanelMessage
      icon={History}
      title="El registro de envíos llega pronto"
      description="Acá vas a ver cada mensaje que salió por Telegram o mail: cuándo, a quién y si llegó bien."
    />
  )
}
