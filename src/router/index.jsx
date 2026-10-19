import { createBrowserRouter } from 'react-router'
import { RUTAS_PANEL } from '../config/rutasPanel'
import AdminLayout from '../layouts/AdminLayout'
import FieldLayout from '../layouts/FieldLayout'
import PublicLayout from '../layouts/PublicLayout'
import AdminHomePage from '../pages/admin/AdminHomePage'
import LoginPage from '../pages/admin/LoginPage'
import MachinesPage from '../pages/admin/MachinesPage'
import RolesPage from '../pages/admin/RolesPage'
import UsersPage from '../pages/admin/UsersPage'
import FieldHomePage from '../pages/field/FieldHomePage'
import NotFoundPage from '../pages/NotFoundPage'
import CatalogPage from '../pages/public/CatalogPage'
import EquipmentDetailPage from '../pages/public/EquipmentDetailPage'
import HomePage from '../pages/public/HomePage'
import RutaModulo from './RutaModulo'
import RutaPrivada from './RutaPrivada'

// Página de cada sección del panel, por el mismo path que tiene en RUTAS_PANEL
const paginasPanel = {
  '/admin/maquinas': <MachinesPage />,
  '/admin/configuracion/usuarios': <UsersPage />,
  '/admin/configuracion/roles': <RolesPage />,
}

// Cada sección exige el módulo que le asigna RUTAS_PANEL: el sidebar y la protección salen de la misma fuente
const rutasPanel = RUTAS_PANEL.map(({ path, modulo }) => ({
  path: path.replace(/^\/admin\//, ''),
  element: <RutaModulo modulo={modulo}>{paginasPanel[path]}</RutaModulo>,
}))

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalogo', element: <CatalogPage /> },
      { path: 'catalogo/:id', element: <EquipmentDetailPage /> },
    ],
  },
  {
    path: 'campo',
    element: <FieldLayout />,
    children: [{ index: true, element: <FieldHomePage /> }],
  },
  // El login va fuera del panel: pantalla completa, sin sidebar ni topbar
  { path: 'admin/login', element: <LoginPage /> },
  {
    // Todo el panel requiere sesión. Inicio lo ve cualquier usuario logueado; el resto, según su módulo
    path: 'admin',
    element: (
      <RutaPrivada>
        <AdminLayout />
      </RutaPrivada>
    ),
    children: [{ index: true, element: <AdminHomePage /> }, ...rutasPanel],
  },
  { path: '*', element: <NotFoundPage /> },
])
