import { Outlet } from 'react-router'

// Dashboard administrativo (desktop-first). La autenticación se agrega en su propia issue.
export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  )
}
