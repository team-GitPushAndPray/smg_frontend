import AdminPlaceholder from '../../components/admin/AdminPlaceholder'

// /admin/alquileres/:id: detalle del alquiler con sus equipos y checklists. Provisorio hasta su issue
export default function RentalDetailPage() {
  return (
    <AdminPlaceholder
      title="Detalle del alquiler"
      description="Cliente, equipos, fechas, ubicación y checklists de entrega y devolución."
    />
  )
}
