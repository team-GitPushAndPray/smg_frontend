import { Outlet } from 'react-router'

// Módulo operativo de campo vía QR (sin login, mobile-first)
export default function FieldLayout() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md p-4">
      <Outlet />
    </div>
  )
}
