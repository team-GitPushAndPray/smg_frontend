import AdminPlaceholder from '../../components/admin/AdminPlaceholder'

// /admin/alquileres/:id/equipos/:equipoId/checklist?tipo= (requiere editar Alquileres): checklist de entrega o devolución
// de un equipo, sin las pestañas del módulo. Provisorio hasta su issue
export default function RentalChecklistPage() {
  return (
    <AdminPlaceholder
      title="Checklist del equipo"
      description="Entrega o devolución de un equipo del alquiler."
    />
  )
}
