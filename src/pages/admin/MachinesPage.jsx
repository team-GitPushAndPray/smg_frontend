import { Plus } from 'lucide-react'
import AdminPlaceholder from '../../components/admin/AdminPlaceholder'
import PermissionBadge from '../../components/admin/PermissionBadge'
import { MODULOS } from '../../config/rutasPanel'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

// Provisorio hasta el módulo real: muestra el nivel de permiso para validar el mecanismo de roles
export default function MachinesPage() {
  const { puedeEditar } = useAuth()
  const { showToast } = useToast()
  const canEdit = puedeEditar(MODULOS.MAQUINAS)

  return (
    <AdminPlaceholder
      title="Máquinas"
      description="Alta, edición y estado de la maquinaria."
      badge={<PermissionBadge puedeEditar={canEdit} />}
      actions={
        canEdit && (
          <button
            type="button"
            onClick={() => showToast('El alta de máquinas llega con el módulo de Máquinas.', { tipo: 'info' })}
            className="btn-primary"
          >
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Nueva máquina
          </button>
        )
      }
    />
  )
}
