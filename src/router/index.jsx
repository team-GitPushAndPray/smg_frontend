import { createBrowserRouter } from 'react-router'
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
    // Los paths del panel coinciden con los de config/rutasPanel.js, que arma el sidebar
    path: 'admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminHomePage /> },
      { path: 'maquinas', element: <MachinesPage /> },
      { path: 'configuracion/usuarios', element: <UsersPage /> },
      { path: 'configuracion/roles', element: <RolesPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
