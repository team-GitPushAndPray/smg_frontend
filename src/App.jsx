import { RouterProvider } from 'react-router'
import AuthProvider from './context/AuthProvider'
import ThemeProvider from './context/ThemeProvider'
import { router } from './router'

// Al terminar la sesión se vuelve al login; con replace, "atrás" no regresa al panel
const goToLogin = () => router.navigate('/admin/login', { replace: true })

function App() {
  return (
    <ThemeProvider>
      <AuthProvider onSessionEnd={goToLogin}>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
