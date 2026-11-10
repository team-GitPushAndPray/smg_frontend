import { BriefcaseBusiness, CloudOff, Plus, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { MODULOS } from '../../config/rutasPanel'
import { usePermiso } from '../../hooks/usePermiso'
import { useToast } from '../../hooks/useToast'
import { useVacantes } from '../../hooks/useVacantes'
import { editarVacante } from '../../services/vacantesService'
import { contar } from '../../utils/historial'
import { getErrorVacante, VACANTE_INEXISTENTE } from '../../utils/vacantes'
import ConfirmDialog from './ConfirmDialog'
import PanelMessage from './PanelMessage'
import VacanteFormModal from './VacanteFormModal'
import VacantesTable, { VacantesTableSkeleton } from './VacantesTable'

/** @import { Vacante } from '../../types/vacantes' */

const NOUN = { one: 'vacante', other: 'vacantes' }
const NOUN_ACTIVAS = { one: 'activa', other: 'activas' }
const textMuted = 'text-neutral-600 dark:text-neutral-400'

const BAJA_CERRADA = { vacante: /** @type {Vacante | null} */ (null), isSubmitting: false, error: '' }

/*
 * Pestaña Vacantes del módulo Postulaciones: listado (GET /vacantes) con alta, edición y activación / desactivación.
 * Las acciones solo se ven con edición en POSTULACIONES. Desactivar pide confirmación; activar va directo.
 * Después de cada cambio se vuelve a pedir el listado, así el conteo de postulaciones y el orden son los del back
 * (mientras llega se sigue viendo la lista anterior, atenuada). Una vacante que ya no existe (404) avisa y recarga
 */
export default function VacantesTab() {
  const { puedeEditar: canEdit } = usePermiso(MODULOS.POSTULACIONES)
  const { showToast } = useToast()
  const { status, vacantes, isLoading, hasData, retry, reload } = useVacantes()
  // Formulario abierto: { vacante: null } para crear, { vacante } para editar
  const [form, setForm] = useState(/** @type {{ vacante: Vacante | null } | null} */ (null))
  const [baja, setBaja] = useState(BAJA_CERRADA)
  // Vacante que se está activando (su ⋯ muestra la carga)
  const [pendingId, setPendingId] = useState(/** @type {number | null} */ (null))

  const avisarInexistente = () => {
    showToast(VACANTE_INEXISTENTE)
    reload()
  }

  const onSaved = () => {
    const esAlta = !form.vacante
    setForm(null)
    showToast(esAlta ? 'Vacante creada y publicada' : 'Cambios guardados', { tipo: 'exito' })
    reload()
  }

  const onGone = () => {
    setForm(null)
    avisarInexistente()
  }

  const activar = async (vacante) => {
    setPendingId(vacante.id)
    try {
      await editarVacante(vacante.id, { activa: true })
      showToast('Vacante activada: ya se ve en el portal', { tipo: 'exito' })
      reload()
    } catch (error) {
      if (error.status === 404) {
        avisarInexistente()
        return
      }
      const mensaje = getErrorVacante(error)
      if (mensaje) showToast(mensaje)
    } finally {
      setPendingId(null)
    }
  }

  // La desactivación pide confirmación; la activación va directo
  const onToggleEstado = (vacante) => {
    if (vacante.activa) setBaja({ vacante, isSubmitting: false, error: '' })
    else activar(vacante)
  }

  const closeBaja = () => setBaja(BAJA_CERRADA)

  const confirmBaja = async () => {
    const { vacante } = baja
    setBaja((current) => ({ ...current, isSubmitting: true, error: '' }))
    try {
      await editarVacante(vacante.id, { activa: false })
      closeBaja()
      showToast('Vacante desactivada', { tipo: 'exito' })
      reload()
    } catch (error) {
      if (error.status === 404) {
        closeBaja()
        avisarInexistente()
        return
      }
      // El error queda en el diálogo, que sigue abierto para reintentar. Un 403 ya lo avisó apiFetch
      setBaja((current) => ({ ...current, isSubmitting: false, error: getErrorVacante(error) ?? '' }))
    }
  }

  const total = vacantes.length
  const activas = vacantes.filter((vacante) => vacante.activa).length

  let content
  if (isLoading && !hasData) {
    content = <VacantesTableSkeleton />
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        icon={CloudOff}
        title="No pudimos cargar las vacantes"
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
        icon={BriefcaseBusiness}
        title="Todavía no hay vacantes"
        description={
          canEdit
            ? 'Creá la primera con «Nueva vacante»: se publica en «Trabajá con nosotros» y empieza a recibir postulaciones.'
            : 'Cuando se cargue una búsqueda laboral, va a aparecer acá.'
        }
      />
    )
  } else {
    content = (
      <VacantesTable
        vacantes={vacantes}
        canEdit={canEdit}
        pendingId={pendingId}
        onEdit={(vacante) => setForm({ vacante })}
        onToggleEstado={onToggleEstado}
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
        {canEdit && (
          <button
            type="button"
            onClick={() => setForm({ vacante: null })}
            disabled={!hasData}
            className="btn-primary shrink-0"
          >
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Nueva vacante
          </button>
        )}
      </div>

      <p role="status" className="sr-only">
        {isLoading
          ? 'Cargando vacantes…'
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
        <VacanteFormModal
          key={form.vacante?.id ?? 'nueva'}
          vacante={form.vacante}
          onClose={() => setForm(null)}
          onSaved={onSaved}
          onGone={onGone}
        />
      )}

      {baja.vacante && (
        <ConfirmDialog
          title="¿Desactivar esta vacante?"
          confirmLabel="Desactivar"
          submittingLabel="Desactivando…"
          isSubmitting={baja.isSubmitting}
          error={baja.error}
          onConfirm={confirmBaja}
          onClose={closeBaja}
        >
          <p>
            <strong className="font-semibold text-black dark:text-white">{baja.vacante.titulo}</strong> deja de verse en
            «Trabajá con nosotros» y deja de recibir postulaciones.
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Las postulaciones que ya llegaron se conservan. Podés activarla de nuevo cuando quieras desde esta pantalla.
          </p>
        </ConfirmDialog>
      )}
    </div>
  )
}
