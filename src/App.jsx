import { RouterProvider } from 'react-router'
import AuthProvider from './context/AuthProvider'
import ThemeProvider from './context/ThemeProvider'
import ToastProvider from './context/ToastProvider'
import { router } from './router'

// Los avisos envuelven a la sesión: AuthProvider los usa para el 403 de la API
function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
