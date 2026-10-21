import { useParams } from 'react-router'
import AdminPlaceholder from '../../components/admin/AdminPlaceholder'

// Provisorio: alta (/admin/maquinas/nuevo) y edición (/admin/maquinas/:id/editar) comparten pantalla; el formulario llega en una próxima etapa
export default function MachineFormPage() {
  const { id } = useParams()
  return id ? (
    <AdminPlaceholder title="Editar equipo" description="Modificá los datos del equipo." />
  ) : (
    <AdminPlaceholder title="Nuevo equipo" description="Cargá una máquina o un aditamento al inventario." />
  )
}
