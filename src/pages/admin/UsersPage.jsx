import { CloudOff, Plus, RotateCw, SearchX, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PanelMessage from '../../components/admin/PanelMessage'
import PermissionBadge from '../../components/admin/PermissionBadge'
import UserFormModal from '../../components/admin/UserFormModal'
import UsersTable, { UsersTableSkeleton } from '../../components/admin/UsersTable'
import UsersToolbar from '../../components/admin/UsersToolbar'
import { MODULOS } from '../../config/rutasPanel'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { useUsuarios } from '../../hooks/useUsuarios'
import { cambiarEstado } from '../../services/usuariosService'
import { normalizeText } from '../../utils/text'
import { getErrorGenerico, getNombreCompleto } from '../../utils/usuarios'

const matchesEstado = {
  todos: () => true,
  activos: (usuario) => usuario.activo,
  inactivos: (usuario) => !usuario.activo,
}

function countLabel(cantidad) {
  return cantidad === 1 ? '1 usuario' : `${cantidad} usuarios`
}

// Configuración › Usuarios: alta, edición, baja y reactivación de los usuarios del panel.
// Con Configuración en "Ver" la pantalla es de solo lectura: sin alta ni menú ⋯
export default function UsersPage() {
  const { usuario: sesion, puedeEditar } = useAuth()
  const canEdit = puedeEditar(MODULOS.CONFIGURACION)
  const { showToast } = useToast()
  const { status, usuarios, roles, retry, refresh, reemplazarUsuario } = useUsuarios()
  const [query, setQuery] = useState('')
  const [estado, setEstado] = useState('todos')
  // Formulario abierto: { usuario: null } para crear, { usuario } para editar
  const [form, setForm] = useState(null)
  const [baja, setBaja] = useState({ usuario: null, isSubmitting: false, error: '' })
  // Usuario que se está reactivando (su ⋯ muestra la carga)
  const [pendingId, setPendingId] = useState(null)

  const rolesSistema = useMemo(() => new Set(roles.filter((rol) => rol.esSistema).map((rol) => rol.id)), [roles])
  const items = useMemo(
    () =>
      usuarios.map((usuario) => ({
        usuario,
        searchText: normalizeText(`${getNombreCompleto(usuario)} ${usuario.email}`),
      })),
    [usuarios],
  )

  // Cada palabra buscada tiene que aparecer en el nombre, el apellido o el email
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  const found = items
    .filter((item) => words.every((word) => item.searchText.includes(word)))
    .map((item) => item.usuario)
  const visibles = found.filter(matchesEstado[estado])
  const counts = {
    todos: found.length,
    activos: found.filter(matchesEstado.activos).length,
    inactivos: found.filter(matchesEstado.inactivos).length,
  }
  const hasFilters = words.length > 0 || estado !== 'todos'

  const clearFilters = () => {
    setQuery('')
    setEstado('todos')
  }

  const onSaved = (guardado) => {
    const isEdit = Boolean(form.usuario)
    setForm(null)
    if (isEdit) {
      reemplazarUsuario(guardado)
      showToast('Cambios guardados', { tipo: 'exito' })
    } else {
      showToast('Usuario creado', { tipo: 'exito' })
      refresh()
    }
  }

  const reactivar = async (usuario) => {
    setPendingId(usuario.id)
    try {
      reemplazarUsuario(await cambiarEstado(usuario.id, true))
      showToast('Usuario reactivado', { tipo: 'exito' })
    } catch (error) {
      const mensaje = error.status === 400 ? error.message : getErrorGenerico(error)
      if (mensaje) showToast(mensaje)
    } finally {
      setPendingId(null)
    }
  }

  // La baja pide confirmación; la reactivación va directo
  const onToggleEstado = (usuario) => {
    if (usuario.activo) setBaja({ usuario, isSubmitting: false, error: '' })
    else reactivar(usuario)
  }

  const closeBaja = () => setBaja({ usuario: null, isSubmitting: false, error: '' })

  const confirmBaja = async () => {
    setBaja((current) => ({ ...current, isSubmitting: true, error: '' }))
    try {
      reemplazarUsuario(await cambiarEstado(baja.usuario.id, false))
      closeBaja()
      showToast('Usuario dado de baja', { tipo: 'exito' })
    } catch (error) {
      // 400: por ejemplo, darse de baja a sí mismo. Se muestra en el diálogo, que queda abierto
      if (error.status === 400) {
        setBaja((current) => ({ ...current, isSubmitting: false, error: error.message }))
        return
      }
      setBaja((current) => ({ ...current, isSubmitting: false }))
      const mensaje = getErrorGenerico(error)
      if (mensaje) showToast(mensaje)
    }
  }

  let content
  if (status === 'loading') {
    content = (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Cargando usuarios…
        </p>
        <UsersTableSkeleton />
      </div>
    )
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar los usuarios"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (usuarios.length === 0) {
    content = (
      <PanelMessage
        icon={Users}
        title="Todavía no hay usuarios"
        description={
          canEdit
            ? 'Creá el primero con «Nuevo usuario» para darle acceso al panel.'
            : 'Cuando un administrador cree usuarios, se van a ver acá.'
        }
      />
    )
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <UsersToolbar
          query={query}
          onQueryChange={setQuery}
          estado={estado}
          onEstadoChange={setEstado}
          counts={counts}
        />
        <p role="status" className="sr-only">
          {hasFilters ? `${countLabel(visibles.length)} encontrados` : countLabel(visibles.length)}
        </p>
        {visibles.length > 0 ? (
          <UsersTable
            usuarios={visibles}
            rolesSistema={rolesSistema}
            sesionId={sesion.id}
            pendingId={pendingId}
            canEdit={canEdit}
            onEdit={(usuario) => setForm({ usuario })}
            onToggleEstado={onToggleEstado}
          />
        ) : (
          <PanelMessage
            icon={SearchX}
            title="Ningún usuario coincide"
            description="Probá con otro nombre o email, o cambiá el filtro de estado."
          >
            <button type="button" onClick={clearFilters} className="btn-tonal">
              Limpiar filtros
            </button>
          </PanelMessage>
        )}
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold sm:text-3xl">Usuarios</h1>
            {!canEdit && <PermissionBadge puedeEditar={false} />}
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Empleados con acceso al panel de gestión.</p>
        </div>
        {/* Sin los roles cargados no se puede elegir uno: el alta espera a que termine la carga */}
        {canEdit && (
          <button
            type="button"
            onClick={() => setForm({ usuario: null })}
            disabled={status !== 'success'}
            className="btn-primary shrink-0"
          >
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Nuevo usuario
          </button>
        )}
      </header>

      {content}

      {form && (
        <UserFormModal usuario={form.usuario} roles={roles} onClose={() => setForm(null)} onSaved={onSaved} />
      )}

      {baja.usuario && (
        <ConfirmDialog
          title="¿Dar de baja este usuario?"
          confirmLabel="Dar de baja"
          submittingLabel="Dando de baja…"
          isSubmitting={baja.isSubmitting}
          error={baja.error}
          onConfirm={confirmBaja}
          onClose={closeBaja}
        >
          <p>
            <strong className="font-semibold text-black dark:text-white">{getNombreCompleto(baja.usuario)}</strong> va
            a perder el acceso al sistema de inmediato.
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Podés reactivarlo cuando quieras desde esta pantalla.</p>
        </ConfirmDialog>
      )}
    </section>
  )
}
