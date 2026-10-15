import { createBrowserRouter } from 'react-router'
import DashboardLayout from '../layouts/DashboardLayout'
import FieldLayout from '../layouts/FieldLayout'
import PublicLayout from '../layouts/PublicLayout'
import DashboardHomePage from '../pages/dashboard/DashboardHomePage'
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
  {
    path: 'admin',
    element: <DashboardLayout />,
    children: [{ index: true, element: <DashboardHomePage /> }],
  },
  { path: '*', element: <NotFoundPage /> },
])
