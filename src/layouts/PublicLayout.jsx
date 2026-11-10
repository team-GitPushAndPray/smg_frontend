import { Outlet } from 'react-router'
import Footer from '../components/public/Footer'
import NavBar from '../components/public/NavBar'
import VendedoresProvider from '../context/VendedoresProvider'

// Portal público y catálogo comercial (sin autenticación).
// El equipo comercial se carga acá porque lo usan la home y el navbar de todas las páginas
export default function PublicLayout() {
  return (
    <VendedoresProvider>
      <div className="flex min-h-svh flex-col">
        <NavBar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </VendedoresProvider>
  )
}
