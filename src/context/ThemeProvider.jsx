import { useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext'

// Misma clave que usa el script de index.html para aplicar el tema antes del primer render
const STORAGE_KEY = 'tema'

function readStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export default function ThemeProvider({ children }) {
  // El script de index.html ya dejó (o no) la clase .dark en <html>
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

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

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}
