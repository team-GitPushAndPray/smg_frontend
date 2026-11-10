import { ArrowLeft, CloudOff, RotateCw, UserRoundSearch } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import PanelMessage from '../../components/admin/PanelMessage'
import PostulacionDetail, { PostulacionDetailSkeleton } from '../../components/admin/PostulacionDetail'
import { MODULOS, RUTAS_POSTULACIONES } from '../../config/rutasPanel'
import { usePermiso } from '../../hooks/usePermiso'
import { usePostulacion } from '../../hooks/usePostulacion'
import { useToast } from '../../hooks/useToast'
import { cambiarEstadoPostulacion } from '../../services/postulacionesService'
import { getErrorEstadoPostulacion, getEstadoPostulacion } from '../../utils/postulaciones'

/** @import { EstadoPostulacion } from '../../types/postulaciones' */

/*
 * /admin/postulaciones/:id (requiere ver Postulaciones): ficha del postulante (GET /postulaciones/:id), con sus datos,
 * el contacto, el mensaje y el CV. Con edición en Postulaciones, el estado se cambia desde un selector
 * (PATCH /postulaciones/:id/estado): el nuevo se ve al momento, el selector se bloquea mientras se guarda y, si falla,
 * vuelve al anterior con el error en un aviso. La bandeja vuelve a pedir al montarse, así que al volver ya lo muestra.
 * "Volver a la bandeja" vuelve con los filtros con los que se abrió (llegan en el state del enlace); si se entró
 * directo por URL, a la bandeja sin filtros (no se usa navigate(-1), que sacaría de la app).
 * Un id inexistente (404) o que no es un número (400) muestra "Postulación no encontrada"
 */
export default function ApplicationDetailPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const { puedeEditar } = usePermiso(MODULOS.POSTULACIONES)
  const { showToast } = useToast()
  const { status, postulacion, retry, actualizar } = usePostulacion(id)
  const [isSavingEstado, setIsSavingEstado] = useState(false)

  const listado = typeof state?.listado === 'string' ? state.listado : ''
  const volverHref = `${RUTAS_POSTULACIONES.bandeja}${listado}`

  // Desde la bandeja se llega con la página scrolleada: la ficha se ve desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  /** @param {EstadoPostulacion} nuevo */
  const onCambiarEstado = async (nuevo) => {
    const { id: postulacionId, estado: anterior } = postulacion
    if (nuevo === anterior) return

    // Solo se toca la misma postulación: si mientras tanto se abrió otra, la respuesta no la pisa
    const conEstado = (estado) => (actual) => (actual.id === postulacionId ? { ...actual, estado } : actual)

    actualizar(conEstado(nuevo))
    setIsSavingEstado(true)
    try {
      const guardada = await cambiarEstadoPostulacion(postulacionId, nuevo)
      actualizar((actual) => (actual.id === postulacionId ? guardada : actual))
      const label = getEstadoPostulacion(guardada.estado)?.label ?? guardada.estado
      showToast(`Estado cambiado a «${label}»`, { tipo: 'exito' })
    } catch (error) {
      actualizar(conEstado(anterior))
      const mensaje = getErrorEstadoPostulacion(error)
      if (mensaje) showToast(mensaje)
    } finally {
      setIsSavingEstado(false)
    }
  }

  let content
  if (status === 'loading') {
    content = (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Cargando postulación…
        </p>
        <PostulacionDetailSkeleton />
      </div>
    )
  } else if (status === 'not-found') {
    content = (
      <PanelMessage
        titleAs="h1"
        icon={UserRoundSearch}
        title="Postulación no encontrada"
        description="La postulación que buscás no existe. Revisá el enlace o buscala en la bandeja."
      >
        <Link to={volverHref} className="btn-tonal">
          Ir a la bandeja
        </Link>
      </PanelMessage>
    )
  } else if (status === 'error') {
    content = (
      <PanelMessage
        role="alert"
        titleAs="h1"
        icon={CloudOff}
        title="No pudimos cargar la postulación"
        description="Revisá tu conexión o intentá de nuevo en unos minutos."
      >
        <button type="button" onClick={retry} className="btn-tonal">
          <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </PanelMessage>
    )
  } else {
    content = (
      <PostulacionDetail
        postulacion={postulacion}
        canEdit={puedeEditar}
        onCambiarEstado={onCambiarEstado}
        isSavingEstado={isSavingEstado}
      />
    )
  }

  return (
    <article className="flex flex-col gap-4">
      <Link
        to={volverHref}
        className="interactive -ml-3 inline-flex min-h-11 items-center gap-2 self-start rounded-control px-3 text-sm font-medium text-neutral-700 hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        Volver a la bandeja
      </Link>

      {content}
    </article>
  )
}
