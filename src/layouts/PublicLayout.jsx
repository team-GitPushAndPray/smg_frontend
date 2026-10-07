import { Outlet } from 'react-router'

// Portal público y catálogo comercial (sin autenticación)
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
