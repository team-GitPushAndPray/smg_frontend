import { CloudOff, LayoutGrid, Plus, RotateCw, Shield } from 'lucide-react'
import { useState } from 'react'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PanelMessage from '../../components/admin/PanelMessage'
import PermissionBadge from '../../components/admin/PermissionBadge'
import PermissionsMatrix, { PermissionsMatrixSkeleton } from '../../components/admin/PermissionsMatrix'
import RoleFormModal from '../../components/admin/RoleFormModal'
import { MODULOS } from '../../config/rutasPanel'
import { useAuth } from '../../hooks/useAuth'
import { useRoles } from '../../hooks/useRoles'
import { useToast } from '../../hooks/useToast'
import { editarRol, guardarModulosRol } from '../../services/rolesService'
import { setNivel } from '../../utils/roles'
import { getErrorGenerico, getRolLabel } from '../../utils/usuarios'

// 400 y 404 traen un motivo concreto del back (módulo inexistente, rol de sistema...): se muestra ese
function getErrorPermisos(error) {
  return error.status === 400 || error.status === 404 ? error.message : getErrorGenerico(error)
}

function withId(ids, id) {
  return new Set(ids).add(id)
}

function withoutId(ids, id) {
  const next = new Set(ids)
  next.delete(id)
  return next
}

// Configuración › Roles y permisos: matriz roles × módulos, alta y edición de roles, y activación / desactivación
export default function RolesPage() {
  const { puedeEditar } = useAuth()
  const { showToast } = useToast()
  const { status, roles, modulos, retry, refresh, actualizarRol } = useRoles()
  const canEdit = puedeEditar(MODULOS.CONFIGURACION)
  // Roles guardando una celda: su fila queda bloqueada hasta que responde el back
  const [savingIds, setSavingIds] = useState(() => new Set())
  // Formulario abierto: { rol: null } para crear, { rol } para editar
  const [form, setForm] = useState(null)
  const [baja, setBaja] = useState({ rol: null, isSubmitting: false, error: '' })
  // Rol que se está activando (su ⋯ muestra la carga)
  const [pendingId, setPendingId] = useState(null)

  // Se muestra el cambio enseguida; si el back lo rechaza, la celda vuelve a su valor anterior
  const cambiarNivel = async (rol, codigo, nivel) => {
    const anteriores = rol.modulos
    const siguientes = setNivel(anteriores, codigo, nivel)
    actualizarRol(rol.id, { modulos: siguientes })
    setSavingIds((ids) => withId(ids, rol.id))
    try {
      await guardarModulosRol(rol.id, siguientes)
      showToast(`Permisos de ${getRolLabel(rol)} actualizados`, { tipo: 'exito' })
    } catch (error) {
      actualizarRol(rol.id, { modulos: anteriores })
      const mensaje = getErrorPermisos(error)
      if (mensaje) showToast(mensaje)
    } finally {
      setSavingIds((ids) => withoutId(ids, rol.id))
    }
  }

  // El back devuelve el rol editado; si no trae algún dato, se completa con lo que se mandó
  const onSaved = (guardado, enviado) => {
    const rol = form.rol
    setForm(null)
    if (rol) {
      actualizarRol(rol.id, { ...enviado, ...guardado, modulos: rol.modulos })
      showToast('Cambios guardados', { tipo: 'exito' })
    } else {
      showToast('Rol creado', { tipo: 'exito' })
      refresh()
    }
  }

  const activar = async (rol) => {
    setPendingId(rol.id)
    try {
      const guardado = await editarRol(rol.id, { activo: true })
      actualizarRol(rol.id, { ...guardado, activo: true, modulos: rol.modulos })
      showToast('Rol activado', { tipo: 'exito' })
    } catch (error) {
      const mensaje = error.status === 400 ? error.message : getErrorGenerico(error)
      if (mensaje) showToast(mensaje)
    } finally {
      setPendingId(null)
    }
  }

  // La desactivación pide confirmación; la activación va directo
  const onToggleEstado = (rol) => {
    if (rol.activo) setBaja({ rol, isSubmitting: false, error: '' })
    else activar(rol)
  }

  const closeBaja = () => setBaja({ rol: null, isSubmitting: false, error: '' })

  const confirmBaja = async () => {
    const { rol } = baja
    setBaja((current) => ({ ...current, isSubmitting: true, error: '' }))
    try {
      const guardado = await editarRol(rol.id, { activo: false })
      actualizarRol(rol.id, { ...guardado, activo: false, modulos: rol.modulos })
      closeBaja()
      showToast('Rol desactivado', { tipo: 'exito' })
    } catch (error) {
      // 400: el back no permite desactivarlo. Se muestra en el diálogo, que queda abierto
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
          Cargando roles y permisos…
        </p>
        <PermissionsMatrixSkeleton />
      </div>
    )
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar los roles"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (roles.length === 0) {
    content = (
      <PanelMessage
        icon={Shield}
        title="Todavía no hay roles"
        description={
          canEdit
            ? 'Creá el primero con «Nuevo rol» y elegí a qué módulos accede.'
            : 'Cuando un administrador cree roles, sus permisos se van a ver acá.'
        }
      />
    )
  } else if (modulos.length === 0) {
    content = (
      <PanelMessage
        icon={LayoutGrid}
        title="No hay módulos cargados"
        description="Los módulos del sistema se cargan desde el servidor. Consultá con soporte técnico."
      />
    )
  } else {
    content = (
      <PermissionsMatrix
        roles={roles}
        modulos={modulos}
        canEdit={canEdit}
        savingIds={savingIds}
        pendingId={pendingId}
        onChangeNivel={cambiarNivel}
        onEdit={(rol) => setForm({ rol })}
        onToggleEstado={onToggleEstado}
      />
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold sm:text-3xl">Roles y permisos</h1>
            {!canEdit && <PermissionBadge puedeEditar={false} />}
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Qué módulos puede usar cada rol. <span className="font-medium text-neutral-700 dark:text-neutral-300">Ver</span>
            : solo consulta. <span className="font-medium text-neutral-700 dark:text-neutral-300">Editar</span>: alta,
            edición y baja.
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setForm({ rol: null })}
            disabled={status !== 'success'}
            className="btn-primary shrink-0"
          >
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Nuevo rol
          </button>
        )}
      </header>

      {content}

      {form && <RoleFormModal rol={form.rol} onClose={() => setForm(null)} onSaved={onSaved} />}

      {baja.rol && (
        <ConfirmDialog
          title="¿Desactivar este rol?"
          confirmLabel="Desactivar"
          submittingLabel="Desactivando…"
          isSubmitting={baja.isSubmitting}
          error={baja.error}
          onConfirm={confirmBaja}
          onClose={closeBaja}
        >
          <p>
            Los usuarios con el rol{' '}
            <strong className="font-semibold text-black dark:text-white">{getRolLabel(baja.rol)}</strong> pierden el
            acceso al sistema de inmediato.
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Podés activarlo de nuevo cuando quieras desde esta pantalla.</p>
        </ConfirmDialog>
      )}
    </section>
  )
}
