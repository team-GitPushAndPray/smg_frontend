import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import AdminBrand from '../components/admin/AdminBrand'
import AdminNav from '../components/admin/AdminNav'
import AdminTopbar from '../components/admin/AdminTopbar'
import { useAuth } from '../hooks/useAuth'

// Panel de gestión (desktop-first): sidebar + topbar + contenido. La protección de rutas y el menú por rol llegan en F-06.
// En celular el sidebar se oculta y su menú se despliega desde la topbar
export default function AdminLayout() {
  const { pathname } = useLocation()
  const { verificarSesion } = useAuth()

  // En cada cambio de sección se confirma que el token siga guardado
  useEffect(() => {
    verificarSesion()
  }, [pathname, verificarSesion])

  return (
    <div className="flex min-h-svh gap-4 p-3 sm:p-4">
      <aside className="sticky top-4 hidden h-[calc(100svh-2rem)] w-60 shrink-0 md:block lg:w-64">
        <div className="glass flex h-full flex-col gap-4 overflow-y-auto p-3">
          <AdminBrand />
          <nav aria-label="Panel de gestión">
            <AdminNav />
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
        <AdminTopbar />
        <main className="flex-1 px-1 pb-4 sm:px-2">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
