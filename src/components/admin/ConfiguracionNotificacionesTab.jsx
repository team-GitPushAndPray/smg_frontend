import { BellRing, CloudOff, Plus, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { MODULOS } from '../../config/rutasPanel'
import { usePermiso } from '../../hooks/usePermiso'
import { useReglasNotificacion } from '../../hooks/useReglasNotificacion'
import { useToast } from '../../hooks/useToast'
import { actualizarRegla, enviarPrueba } from '../../services/notificacionesService'
import { contar } from '../../utils/historial'
import { getErrorPrueba, REGLA_INEXISTENTE } from '../../utils/notificaciones'
import { getErrorGenerico } from '../../utils/usuarios'
import PanelMessage from './PanelMessage'
import ReglaNotificacionFormModal from './ReglaNotificacionFormModal'
import ReglasNotificacionTable, { ReglasNotificacionTableSkeleton } from './ReglasNotificacionTable'

/** @import { ReglaNotificacion } from '../../types/notificaciones' */

const NOUN = { one: 'regla', other: 'reglas' }
const NOUN_ACTIVAS = { one: 'activa', other: 'activas' }
const textMuted = 'text-neutral-600 dark:text-neutral-400'

// Agrega o saca un id de un Set sin mutar el anterior (para el estado de React)
function conId(set, id, presente) {
  const next = new Set(set)
  if (presente) next.add(id)
  else next.delete(id)
  return next
}

/*
 * Sección Configuración de /admin/avisos: reglas de notificación (GET /notificaciones/reglas), es decir, qué tipo de
 * aviso le llega a qué destino y por qué canal.
 * Con edición en Avisos: "Nueva regla", Editar, el switch de Activa y Enviar prueba. Sin edición la tabla se ve igual,
 * con los switches deshabilitados y sin acciones.
 * - El switch se ve cambiado al instante (PATCH { activo } por detrás); si el back lo rechaza, vuelve atrás y avisa.
 * - "Enviar prueba" manda un mensaje al canal y destino de la regla: aviso de éxito, o el error con el detalle del back.
 * - Después de un alta o una edición se vuelve a pedir la lista, así el orden es el del back (mientras llega se sigue
 *   viendo la anterior, atenuada). Una regla que ya no existe (404) avisa y recarga
 */
export default function ConfiguracionNotificacionesTab() {
  const { puedeEditar: canEdit } = usePermiso(MODULOS.AVISOS)
  const { showToast } = useToast()
  const { status, reglas, isLoading, hasData, retry, reload, reemplazarRegla } = useReglasNotificacion()
  // Formulario abierto: { regla: null } para crear, { regla } para editar
  const [form, setForm] = useState(/** @type {{ regla: ReglaNotificacion | null } | null} */ (null))
  const [guardandoIds, setGuardandoIds] = useState(() => new Set())
  const [probandoIds, setProbandoIds] = useState(() => new Set())

  const avisarInexistente = () => {
    showToast(REGLA_INEXISTENTE)
    reload()
  }

  const onSaved = (creadas) => {
    const esAlta = !form.regla
    setForm(null)
    if (esAlta) showToast(creadas === 1 ? 'Regla creada' : `Se crearon ${creadas} reglas`, { tipo: 'exito' })
    else showToast('Cambios guardados', { tipo: 'exito' })
    reload()
  }

  const onGone = () => {
    setForm(null)
    avisarInexistente()
  }

  const onToggleActiva = async (regla, activo) => {
    reemplazarRegla(regla.id, { activo })
    setGuardandoIds((current) => conId(current, regla.id, true))
    try {
      await actualizarRegla(regla.id, { activo })
    } catch (error) {
      reemplazarRegla(regla.id, { activo: regla.activo })
      if (error.status === 404) {
        avisarInexistente()
        return
      }
      const mensaje = getErrorGenerico(error)
      if (mensaje) showToast(`No se pudo ${activo ? 'activar' : 'desactivar'} la regla. ${mensaje}`)
    } finally {
      setGuardandoIds((current) => conId(current, regla.id, false))
    }
  }

  const onProbar = async (regla) => {
    setProbandoIds((current) => conId(current, regla.id, true))
    try {
      await enviarPrueba({ canal: regla.canal, destino: regla.destino })
      showToast(`Mensaje de prueba enviado a ${regla.etiqueta}`, { tipo: 'exito' })
    } catch (error) {
      const mensaje = getErrorPrueba(error)
      if (mensaje) showToast(mensaje)
    } finally {
      setProbandoIds((current) => conId(current, regla.id, false))
    }
  }

  const total = reglas.length
  const activas = reglas.filter((regla) => regla.activo).length

  let content
  if (isLoading && !hasData) {
    content = <ReglasNotificacionTableSkeleton />
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar las reglas"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else if (total === 0) {
    content = (
      <PanelMessage
        icon={BellRing}
        title="Todavía no hay reglas"
        description={
          canEdit
            ? 'Creá una para que los avisos salgan por Telegram o mail.'
            : 'Cuando alguien con permiso de edición cree una, los avisos van a salir por Telegram o mail.'
        }
      >
        {canEdit && (
          <button type="button" onClick={() => setForm({ regla: null })} className="btn-tonal">
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Nueva regla
          </button>
        )}
      </PanelMessage>
    )
  } else {
    content = (
      <ReglasNotificacionTable
        reglas={reglas}
        canEdit={canEdit}
        guardandoIds={guardandoIds}
        probandoIds={probandoIds}
        onToggleActiva={onToggleActiva}
        onEdit={(regla) => setForm({ regla })}
        onProbar={onProbar}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* El contador lo leen los lectores en el status de abajo; el span vacío mantiene el botón a la derecha */}
        {hasData && total > 0 ? (
          <p aria-hidden="true" className={`text-sm tabular-nums ${textMuted}`}>
            {contar(total, NOUN)} · {contar(activas, NOUN_ACTIVAS)}
          </p>
        ) : (
          <span aria-hidden="true" className="hidden sm:block" />
        )}
        {canEdit && total > 0 && (
          <button type="button" onClick={() => setForm({ regla: null })} className="btn-primary shrink-0">
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Nueva regla
          </button>
        )}
      </div>

      <p role="status" className="sr-only">
        {isLoading
          ? 'Cargando reglas…'
          : status === 'success'
            ? `${contar(total, NOUN)}, ${contar(activas, NOUN_ACTIVAS)}`
            : ''}
      </p>

      {/* Mientras llega la lista actualizada se sigue viendo la anterior, atenuada */}
      <div
        aria-busy={isLoading}
        className={`transition-opacity duration-200 ease-glass ${isLoading && hasData ? 'pointer-events-none opacity-60' : ''}`}
      >
        {content}
      </div>

      {form && (
        <ReglaNotificacionFormModal
          key={form.regla?.id ?? 'nueva'}
          regla={form.regla}
          onClose={() => setForm(null)}
          onSaved={onSaved}
          onGone={onGone}
        />
      )}
    </div>
  )
}
