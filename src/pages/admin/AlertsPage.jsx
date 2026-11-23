import AvisosTab from '../../components/admin/AvisosTab'
import ConfiguracionNotificacionesTab from '../../components/admin/ConfiguracionNotificacionesTab'
import PermissionBadge from '../../components/admin/PermissionBadge'
import RegistroEnviosTab from '../../components/admin/RegistroEnviosTab'
import SegmentedTabs from '../../components/admin/SegmentedTabs'
import { MODULOS } from '../../config/rutasPanel'
import { useFiltrosAvisos } from '../../hooks/useFiltrosAvisos'
import { usePermiso } from '../../hooks/usePermiso'
import { SECCIONES_AVISOS } from '../../utils/avisos'

// Bajada del encabezado de cada sección
const DESCRIPCIONES = {
  avisos: 'Services y certificaciones de la flota: lo vencido, lo que vence pronto y lo ya atendido.',
  configuracion: 'Qué avisos le llegan a cada grupo o casilla, y por qué canal.',
  registro: 'Cada mensaje que salió por Telegram o mail, con su resultado.',
}

const SECCIONES = {
  avisos: AvisosTab,
  configuracion: ConfiguracionNotificacionesTab,
  registro: RegistroEnviosTab,
}

/*
 * /admin/avisos (requiere ver Avisos). Tres secciones, con la activa en la URL (?tab=): Avisos (el centro de avisos,
 * con sus propias pestañas Pendientes / Atendidos en ?estado=), Configuración (a quién le llega cada tipo de aviso y
 * por qué canal) y Registro de envíos. Solo se monta la sección abierta, que pide sus datos al abrirse.
 * Sin edición en Avisos todas se ven, pero en modo lectura
 */
export default function AlertsPage() {
  const { puedeEditar } = usePermiso(MODULOS.AVISOS)
  const { seccion, setSeccion } = useFiltrosAvisos()
  const Seccion = SECCIONES[seccion]

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">Avisos</h1>
          {!puedeEditar && <PermissionBadge puedeEditar={false} />}
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">{DESCRIPCIONES[seccion]}</p>
      </header>

      <SegmentedTabs pestanas={SECCIONES_AVISOS} activa={seccion} onCambiar={setSeccion} label="Secciones de Avisos">
        <Seccion />
      </SegmentedTabs>
    </section>
  )
}
