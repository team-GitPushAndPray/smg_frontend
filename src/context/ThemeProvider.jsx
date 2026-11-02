import { useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext'

// Misma clave que usa el script de index.html para aplicar el tema antes del primer render
const STORAGE_KEY = 'tema'

// Rutas del módulo de campo: se usan al sol, así que van siempre en modo claro. Mismo criterio que index.html
const RUTA_CAMPO = /^\/(campo|c)(\/|$)/

function readStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

// Preferencia del usuario: la elegida con el botón o, si no eligió, la del sistema operativo
function prefersDark() {
  const stored = readStoredTheme()
  if (stored) return stored === 'oscuro'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(prefersDark)
  // Lo prende FieldLayout mientras está montado; arranca prendido si la página se abrió en una ruta de campo
  const [forcedLight, setForcedLight] = useState(() => RUTA_CAMPO.test(window.location.pathname))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark && !forcedLight)
  }, [isDark, forcedLight])

  // Mientras el usuario no elija, el tema sigue al del sistema operativo
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event) => {
      if (!readStoredTheme()) setIsDark(event.matches)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'oscuro' : 'claro')
    } catch {
      // Sin acceso a localStorage: el cambio dura solo esta sesión
    }
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setForcedLight }}>{children}</ThemeContext.Provider>
  )
}
