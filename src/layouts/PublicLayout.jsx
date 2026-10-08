import { Outlet } from 'react-router'
import Footer from '../components/public/Footer'
import NavBar from '../components/public/NavBar'

// Portal público y catálogo comercial (sin autenticación)
export default function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
