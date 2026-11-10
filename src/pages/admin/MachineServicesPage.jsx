import { CloudOff, RotateCw, Wrench } from 'lucide-react'
import { useState } from 'react'
import EditarDescripcionServicioModal from '../../components/admin/EditarDescripcionServicioModal'
import EscalonServicioCard, { EscalonServicioCardSkeleton } from '../../components/admin/EscalonServicioCard'
import PanelMessage from '../../components/admin/PanelMessage'
import PermissionBadge from '../../components/admin/PermissionBadge'
import { MODULOS } from '../../config/rutasPanel'
import { useEscalonesServicio } from '../../hooks/useEscalonesServicio'
import { usePermiso } from '../../hooks/usePermiso'

/*
 * Servicios (pestaña de Máquinas): los tres tipos de service (250, 500 y 1000 hs) en el orden del back, de menor a
 * mayor, con su descripción. La ve todo el que ve Máquinas; con edición en el módulo, cada tipo tiene
 * "Editar descripción". Los tipos son fijos: no hay alta, baja ni edición de horas o nombre
 */
export default function MachineServicesPage() {
  const { puedeEditar } = usePermiso(MODULOS.MAQUINAS)
  const { status, escalones, retry, actualizarEscalon } = useEscalonesServicio()
  // Tipo con el modal de edición abierto
  const [editando, setEditando] = useState(null)

  let content
  if (status === 'loading') {
    content = <EscalonServicioCardSkeleton />
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar los servicios"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (escalones.length === 0) {
    content = (
      <PanelMessage
        icon={Wrench}
        title="No hay tipos de service"
        description="Los tipos de service los carga el sistema. Si no aparecen, avisale al administrador."
      />
    )
  } else {
    content = (
      <ul className="flex flex-col gap-4">
        {escalones.map((escalon) => (
          <li key={escalon.id}>
            <EscalonServicioCard escalon={escalon} onEditar={puedeEditar ? setEditando : undefined} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">Servicios</h1>
          {!puedeEditar && <PermissionBadge puedeEditar={false} />}
        </div>
        <p className="text-pretty text-neutral-600 dark:text-neutral-400">
          Tipos de service preventivo según las horas de motor y qué incluye cada uno.
        </p>
      </header>

      <p role="status" className="sr-only">
        {status === 'loading' ? 'Cargando servicios…' : ''}
      </p>

      <div aria-busy={status === 'loading'}>{content}</div>

      {editando && (
        <EditarDescripcionServicioModal
          escalon={editando}
          onClose={() => setEditando(null)}
          onSaved={actualizarEscalon}
          onStale={retry}
        />
      )}
    </section>
  )
}
