import { Outlet } from 'react-router'
import MaquinasTabs from '../components/admin/MaquinasTabs'

/*
 * Layout del módulo Máquinas, dentro del panel: pestañas Inventario / Servicios arriba y la pantalla de la ruta abajo.
 * Las pantallas de un equipo (alta, detalle, edición, historial) no usan este layout: van sin pestañas
 */
export default function MaquinasLayout() {
  return (
    <div className="flex flex-col gap-6">
      <MaquinasTabs />
      <Outlet />
    </div>
  )
}
