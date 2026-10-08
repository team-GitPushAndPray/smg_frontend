import { RouterProvider } from 'react-router'
import ThemeProvider from './context/ThemeProvider'
import { router } from './router'

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
