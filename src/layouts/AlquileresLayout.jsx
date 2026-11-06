import { Outlet } from 'react-router'
import AlquileresTabs from '../components/admin/AlquileresTabs'

/*
 * Layout del módulo Alquileres, dentro del panel: pestañas Alquileres / Clientes arriba y la pantalla de la ruta abajo.
 * El checklist de entrega/devolución no usa este layout: va sin pestañas, para no distraer mientras se completa
 */
export default function AlquileresLayout() {
  return (
    <div className="flex flex-col gap-6">
      <AlquileresTabs />
      <Outlet />
    </div>
  )
}
