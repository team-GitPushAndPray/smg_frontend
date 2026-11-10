import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

/*
 * Devuelve el id de la sección que se está viendo, para marcarla en el navbar.
 * Una sección queda activa cuando su borde superior pasa el primer tercio de la pantalla;
 * al llegar al fondo se activa la última (contacto es corta y nunca llegaría a ese punto).
 * `ids` tiene que ser un array estable (definido fuera del componente).
 */
export function useActiveSection(ids) {
  const { pathname } = useLocation()
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
      // Si la página entra entera en pantalla no hay scroll: no cuenta como "llegar al fondo"
      const scrolledToBottom =
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      const threshold = window.innerHeight / 3

      let current = null
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= threshold) current = section.id
      }
      if (scrolledToBottom && sections.length > 0) current = sections.at(-1).id

      setActiveId(current)
    }

    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [ids, pathname])

  return activeId
}
