import { createBrowserRouter } from 'react-router'
import { MODULOS, RUTAS_PANEL } from '../config/rutasPanel'
import AdminLayout from '../layouts/AdminLayout'
import AlquileresLayout from '../layouts/AlquileresLayout'
import FieldLayout from '../layouts/FieldLayout'
import PublicLayout from '../layouts/PublicLayout'
import AdminHomePage from '../pages/admin/AdminHomePage'
import ClientDetailPage from '../pages/admin/ClientDetailPage'
import ClientsPage from '../pages/admin/ClientsPage'
import LoginPage from '../pages/admin/LoginPage'
import MachineChecklistPage from '../pages/admin/MachineChecklistPage'
import MachineDetailPage from '../pages/admin/MachineDetailPage'
import MachineFormPage from '../pages/admin/MachineFormPage'
import MachineHistoryPage from '../pages/admin/MachineHistoryPage'
import MachinesPage from '../pages/admin/MachinesPage'
import RentalChecklistPage from '../pages/admin/RentalChecklistPage'
import RentalDetailPage from '../pages/admin/RentalDetailPage'
import RentalFormPage from '../pages/admin/RentalFormPage'
import RentalsPage from '../pages/admin/RentalsPage'
import RolesPage from '../pages/admin/RolesPage'
import UsersPage from '../pages/admin/UsersPage'
import ChecklistPage from '../pages/field/ChecklistPage'
import FieldHomePage from '../pages/field/FieldHomePage'
import NotFoundPage from '../pages/NotFoundPage'
import CatalogPage from '../pages/public/CatalogPage'
import EquipmentDetailPage from '../pages/public/EquipmentDetailPage'
import HomePage from '../pages/public/HomePage'
import RutaModulo from './RutaModulo'
import RutaPrivada from './RutaPrivada'

/*
 * Pantallas del módulo Alquileres dentro de su layout (pestañas Alquileres / Clientes), relativas a /admin/alquileres.
 * El módulo ya lo exige la sección; el alta, además, poder editarlo. Ver RUTAS_ALQUILERES
 */
const rutasAlquileres = [
  { index: true, element: <RentalsPage /> },
  {
    path: 'nuevo',
    element: (
      <RutaModulo modulo={MODULOS.ALQUILERES} requiereEdicion>
        <RentalFormPage />
      </RutaModulo>
    ),
  },
  { path: ':id', element: <RentalDetailPage /> },
  { path: 'clientes', element: <ClientsPage /> },
  { path: 'clientes/:id', element: <ClientDetailPage /> },
]

// Página de cada sección del panel, por el mismo path que tiene en RUTAS_PANEL. Si la sección tiene pantallas propias
// (subrutasPanel), su página es el layout del módulo, que las muestra en su <Outlet />
const paginasPanel = {
  '/admin/maquinas': <MachinesPage />,
  '/admin/alquileres': <AlquileresLayout />,
  '/admin/configuracion/usuarios': <UsersPage />,
  '/admin/configuracion/roles': <RolesPage />,
}

const subrutasPanel = {
  '/admin/alquileres': rutasAlquileres,
}

// Cada sección exige el módulo que le asigna RUTAS_PANEL: el sidebar y la protección salen de la misma fuente
const rutasPanel = RUTAS_PANEL.map(({ path, modulo }) => ({
  path: path.replace(/^\/admin\//, ''),
  element: <RutaModulo modulo={modulo}>{paginasPanel[path]}</RutaModulo>,
  children: subrutasPanel[path],
}))

/*
 * El checklist de entrega/devolución de un equipo alquilado va fuera del panel, a pantalla completa como el módulo de
 * campo (FieldLayout: sin sidebar ni topbar, siempre en claro), pero con sesión y exigiendo poder editar Alquileres
 */
const rutaChecklistAlquiler = {
  path: 'admin/alquileres/:id/equipos/:equipoId/checklist',
  element: (
    <RutaPrivada>
      <FieldLayout />
    </RutaPrivada>
  ),
  children: [
    {
      index: true,
      element: (
        <RutaModulo modulo={MODULOS.ALQUILERES} requiereEdicion>
          <RentalChecklistPage />
        </RutaModulo>
      ),
    },
  ],
}

// Pantallas de Máquinas fuera del sidebar (RUTAS_MAQUINAS): el alta y la edición exigen poder editar el módulo; el detalle y el historial, solo verlo
const rutasMaquinas = [
  {
    path: 'maquinas/nuevo',
    element: (
      <RutaModulo modulo={MODULOS.MAQUINAS} requiereEdicion>
        <MachineFormPage />
      </RutaModulo>
    ),
  },
  {
    path: 'maquinas/:id',
    element: (
      <RutaModulo modulo={MODULOS.MAQUINAS}>
        <MachineDetailPage />
      </RutaModulo>
    ),
  },
  {
    path: 'maquinas/:id/editar',
    element: (
      <RutaModulo modulo={MODULOS.MAQUINAS} requiereEdicion>
        <MachineFormPage />
      </RutaModulo>
    ),
  },
  // El historial es de solo lectura: lo ve todo el que ve el inventario
  {
    path: 'maquinas/:id/historial',
    element: (
      <RutaModulo modulo={MODULOS.MAQUINAS}>
        <MachineHistoryPage />
      </RutaModulo>
    ),
  },
  {
    path: 'maquinas/:id/historial/checklists/:checklistId',
    element: (
      <RutaModulo modulo={MODULOS.MAQUINAS}>
        <MachineChecklistPage />
      </RutaModulo>
    ),
  },
]

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalogo', element: <CatalogPage /> },
      { path: 'catalogo/:id', element: <EquipmentDetailPage /> },
    ],
  },
  // Módulo de campo: público y sin el layout del portal ni del panel. /c/:token es lo que abre el QR de cada equipo
  {
    element: <FieldLayout />,
    children: [
      { path: 'campo', element: <FieldHomePage /> },
      { path: 'c/:token', element: <ChecklistPage /> },
    ],
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
    children: [{ index: true, element: <AdminHomePage /> }, ...rutasPanel, ...rutasMaquinas],
  },
  rutaChecklistAlquiler,
  { path: '*', element: <NotFoundPage /> },
])
