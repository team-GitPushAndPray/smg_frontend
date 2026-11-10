import { Construction } from 'lucide-react'
import PanelMessage from '../../components/admin/PanelMessage'
import PermissionBadge from '../../components/admin/PermissionBadge'
import SegmentedTabs from '../../components/admin/SegmentedTabs'
import VacantesTab from '../../components/admin/VacantesTab'
import { MODULOS } from '../../config/rutasPanel'
import { useFiltrosPostulaciones } from '../../hooks/useFiltrosPostulaciones'
import { usePermiso } from '../../hooks/usePermiso'
import { PESTANAS_POSTULACIONES } from '../../utils/vacantes'

/*
 * /admin/postulaciones (requiere ver Postulaciones): búsquedas laborales del portal "Trabajá con nosotros".
 * Dos pestañas, con la activa en la URL (?tab=): Bandeja (las postulaciones recibidas; se completa en otra issue) y
 * Vacantes (alta, edición y activación / desactivación). Solo se monta la pestaña abierta, que pide sus datos al abrirse
 */
export default function ApplicationsPage() {
  const { puedeEditar } = usePermiso(MODULOS.POSTULACIONES)
  const { tab, setPestana } = useFiltrosPostulaciones()

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">Postulaciones</h1>
          {!puedeEditar && <PermissionBadge puedeEditar={false} />}
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">
          Vacantes publicadas en «Trabajá con nosotros» y las postulaciones que llegan.
        </p>
      </header>

      <SegmentedTabs pestanas={PESTANAS_POSTULACIONES} activa={tab} onCambiar={setPestana} label="Postulaciones">
        {tab === 'vacantes' ? (
          <VacantesTab />
        ) : (
          <PanelMessage
            icon={Construction}
            title="Bandeja en construcción"
            description="Acá vas a ver las postulaciones recibidas para cada vacante. Se habilita en una próxima etapa."
          />
        )}
      </SegmentedTabs>
    </section>
  )
}
