import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  const label = isDark ? 'Activar modo claro' : 'Activar modo oscuro'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="interactive relative grid size-11 place-items-center rounded-control text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <Moon
        size={20}
        strokeWidth={1.75}
        aria-hidden="true"
        className="col-start-1 row-start-1 transition-[transform,opacity] duration-300 ease-glass dark:-rotate-90 dark:scale-50 dark:opacity-0"
      />
      <Sun
        size={20}
        strokeWidth={1.75}
        aria-hidden="true"
        className="col-start-1 row-start-1 rotate-90 scale-50 opacity-0 transition-[transform,opacity] duration-300 ease-glass dark:rotate-0 dark:scale-100 dark:opacity-100"
      />
    </button>
  )
}
