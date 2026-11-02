import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { useTheme } from '../hooks/useTheme'

/*
 * Módulo operativo de campo vía QR (/campo y /c/:token): sin login, sin navbar ni footer, mobile-first.
 * Se usa al sol: fondo sólido y siempre en modo claro mientras se está acá. Pensado a 360px; en desktop, igual y centrado
 */
export default function FieldLayout() {
  const { setForcedLight } = useTheme()

  useEffect(() => {
    setForcedLight(true)
    return () => setForcedLight(false)
  }, [setForcedLight])

  return (
    <div className="campo-page">
      <div className="mx-auto w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
