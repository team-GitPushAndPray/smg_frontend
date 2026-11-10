import { ArrowLeft, CircleAlert, Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate({ email, password }) {
  const errors = {}
  if (!email) errors.email = 'Ingresá tu email.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Ingresá un email válido.'
  if (!password) errors.password = 'Ingresá tu contraseña.'
  return errors
}

// El back responde 401 sin distinguir si falló el email o la contraseña, y así se muestra
function getLoginErrorMessage(error) {
  if (error.status === 401) return 'Email o contraseña incorrectos.'
  if (error.status === 0) return `${error.message}. Revisá tu conexión e intentá de nuevo.`
  return 'No se pudo iniciar sesión. Intentá de nuevo en unos minutos.'
}

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="text-sm text-brand-700 dark:text-brand-400">
      {message}
    </p>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const [values, setValues] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const onChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    // El error de un campo se va apenas se lo corrige
    if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: undefined }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const data = { email: values.email.trim(), password: values.password }
    const errors = validate(data)
    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length > 0) {
      // El foco va al primer campo con error
      event.currentTarget.elements[Object.keys(errors)[0]].focus()
      return
    }

    // Al guardarse el usuario, LoginPage redirige al panel
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
    } catch (error) {
      setFormError(getLoginErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 text-left">
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-control bg-brand-600/10 px-3.5 py-3 text-sm text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
        >
          <CircleAlert size={18} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          value={values.email}
          onChange={onChange}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          placeholder="nombre@empresa.com"
          className="field px-3.5"
        />
        <FieldError id="email-error" message={fieldErrors.email} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            value={values.password}
            onChange={onChange}
            disabled={isSubmitting}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            className="field pr-12 pl-3.5"
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={isPasswordVisible}
            title={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="interactive absolute inset-y-0 right-0 grid w-11 place-items-center rounded-control text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            {isPasswordVisible ? (
              <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Eye size={18} strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </div>
        <FieldError id="password-error" message={fieldErrors.password} />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-1 w-full">
        {isSubmitting && <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />}
        {isSubmitting ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}

// Sección del panel a la que se quería entrar antes de pasar por el login (la guarda <RutaPrivada>)
function getDestination(state) {
  const from = state?.from
  const isPanelRoute = /^\/admin(\/|$)/.test(from?.pathname ?? '') && !from.pathname.startsWith('/admin/login')
  return isPanelRoute ? from : '/admin'
}

// Pantalla completa, sin layout. Con una sesión activa redirige al panel (a la sección de origen, si había)
export default function LoginPage() {
  const { usuario, cargando } = useAuth()
  const { state } = useLocation()

  if (usuario) return <Navigate to={getDestination(state)} replace />

  return (
    <div className="flex min-h-svh flex-col p-3 sm:p-4">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <main className="flex flex-1 items-center justify-center py-8">
        <section className="glass-strong flex w-full max-w-sm flex-col gap-6 px-6 py-8 text-center sm:px-8 sm:py-10">
          <div className="flex flex-col items-center gap-4">
            <span className="icon-badge">
              <LockKeyhole size={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold tracking-tight text-brand-700 dark:text-brand-400">SGM</p>
              <h1 className="text-2xl font-semibold">Acceso administración</h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Ingresá con tu cuenta del panel de gestión.
              </p>
            </div>
          </div>

          {cargando ? (
            <p role="status" className="flex items-center justify-center gap-2 py-6 text-sm text-neutral-600 dark:text-neutral-400">
              <LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" className="animate-spin" />
              Verificando sesión…
            </p>
          ) : (
            <LoginForm />
          )}

          <Link
            to="/"
            className="interactive mx-auto flex min-h-11 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
            Volver al sitio
          </Link>
        </section>
      </main>
    </div>
  )
}
