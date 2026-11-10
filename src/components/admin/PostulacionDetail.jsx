import { Download, FileText, Mail, MessageCircle } from 'lucide-react'
import {
  formatFechaHoraPostulacion,
  getMailtoPostulacion,
  getNombrePostulante,
} from '../../utils/postulaciones'
import { getWhatsappUrl } from '../../utils/vendedores'
import EstadoPostulacionBadge from './EstadoPostulacionBadge'
import EstadoPostulacionSelect from './EstadoPostulacionSelect'
import PermissionBadge from './PermissionBadge'

/** @import { EstadoPostulacion, Postulacion } from '../../types/postulaciones' */

const skeletonBar = 'animate-pulse rounded-control bg-black/5 dark:bg-white/10'
const sectionClass = 'glass flex flex-col gap-5 p-6 sm:p-8'
// Columna principal flexible y una lateral fija para el CV (y, en M14, el puntaje y el resumen de la IA)
const layoutClass = 'grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]'

const textStrong = 'text-black dark:text-white'
const textSoft = 'text-neutral-700 dark:text-neutral-300'
const textMuted = 'text-neutral-600 dark:text-neutral-400'

/*
 * Un medio de contacto: el dato tal cual lo escribió el postulante (para poder copiarlo) y, al lado, la acción que lo
 * abre (`external`: en otra pestaña). Sin `href` (un teléfono sin dígitos) queda solo el dato
 */
function Contacto({ label, value, href, external = false, action, actionLabel, icon: Icon, hint }) {
  return (
    <div className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0">
      <dt className={`text-sm ${textMuted}`}>{label}</dt>
      <dd className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className={`min-w-0 font-medium break-all ${textStrong}`}>{value}</span>
        {href && (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            aria-label={actionLabel}
            className="btn-tonal shrink-0 self-start sm:self-auto"
          >
            <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            {action}
          </a>
        )}
      </dd>
      {hint && <p className={`text-sm text-pretty ${textMuted}`}>{hint}</p>}
    </div>
  )
}

/**
 * Ficha de un postulante: encabezado con el nombre, la vacante y la fecha; contacto (el email abre el correo con el
 * asunto cargado y el teléfono, WhatsApp); el mensaje, si lo dejó; y el CV, que se abre en otra pestaña.
 * Con `canEdit`, el estado se cambia desde un selector en el encabezado (`onCambiarEstado`, deshabilitado mientras
 * `isSavingEstado`); sin edición se ve solo el badge del estado, con "Solo lectura"
 * @param {{
 *   postulacion: Postulacion,
 *   canEdit: boolean,
 *   onCambiarEstado: (estado: EstadoPostulacion) => void,
 *   isSavingEstado: boolean,
 * }} props
 */
export default function PostulacionDetail({ postulacion, canEdit, onCambiarEstado, isSavingEstado }) {
  const { vacante } = postulacion
  const nombre = getNombrePostulante(postulacion)
  const telefono = postulacion.telefono.trim()
  const whatsappUrl = getWhatsappUrl(telefono)
  const mensaje = postulacion.mensaje?.trim()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className={`text-sm font-medium ${textMuted}`}>
            Se postuló el{' '}
            <time dateTime={postulacion.creado_en} className="tabular-nums">
              {formatFechaHoraPostulacion(postulacion.creado_en)}
            </time>
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">{nombre}</h1>
            {!canEdit && <PermissionBadge puedeEditar={false} />}
          </div>
          <p className={`text-pretty ${textSoft}`}>
            Vacante: <span className={`font-medium ${textStrong}`}>{vacante?.titulo ?? '—'}</span>
            {vacante && !vacante.activa && <span className={textMuted}> (inactiva)</span>}
          </p>
          {!canEdit && (
            <div className="mt-1 flex items-center gap-2">
              <span className={`text-sm ${textMuted}`}>Estado:</span>
              <EstadoPostulacionBadge estado={postulacion.estado} />
            </div>
          )}
        </div>
        {canEdit && (
          <EstadoPostulacionSelect
            id="estado-postulacion"
            value={postulacion.estado}
            onChange={onCambiarEstado}
            isSaving={isSavingEstado}
          />
        )}
      </header>

      <div className={layoutClass}>
        <div className="flex flex-col gap-6">
          <section aria-labelledby="contacto-postulante" className={sectionClass}>
            <h2 id="contacto-postulante" className="text-lg font-semibold">
              Contacto
            </h2>
            <dl className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
              <Contacto
                label="Email"
                value={postulacion.email}
                href={getMailtoPostulacion(postulacion)}
                icon={Mail}
                action="Enviar email"
                actionLabel={`Enviar un email a ${nombre}`}
              />
              <Contacto
                label="Teléfono"
                value={telefono}
                href={whatsappUrl}
                external
                icon={MessageCircle}
                action="WhatsApp"
                actionLabel={`Escribir por WhatsApp a ${nombre} (se abre en otra pestaña)`}
                hint={whatsappUrl && 'Si el chat no abre, copiá el número tal como lo escribió.'}
              />
            </dl>
          </section>

          {mensaje && (
            <section aria-labelledby="mensaje-postulante" className={sectionClass}>
              <h2 id="mensaje-postulante" className="text-lg font-semibold">
                Mensaje del postulante
              </h2>
              <p className={`leading-relaxed text-pretty break-words whitespace-pre-line ${textSoft}`}>{mensaje}</p>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="cv-postulante" className={`${sectionClass} gap-4`}>
            <div className="flex items-center gap-3">
              <span className="icon-badge">
                <FileText size={20} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h2 id="cv-postulante" className="text-lg font-semibold">
                Currículum
              </h2>
            </div>
            <p className={`text-sm break-all ${textSoft}`}>
              CV: <span className={`font-medium ${textStrong}`}>{postulacion.cv_nombre_original}</span>
            </p>
            {/* Cloudinary es otro dominio: `download` no sirve, el PDF se abre en el visor y se descarga desde ahí */}
            <a
              href={postulacion.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Descargar CV de ${nombre}: ${postulacion.cv_nombre_original} (se abre en otra pestaña)`}
              className="btn-primary w-full"
            >
              <Download size={18} strokeWidth={1.75} aria-hidden="true" />
              Descargar CV
            </a>
            <p className={`text-sm text-pretty ${textMuted}`}>Se abre en una pestaña nueva, en el visor de PDF.</p>
          </section>

          {/* M14: acá va el bloque del puntaje y el resumen de la IA. Por ahora queda vacío */}
        </div>
      </div>
    </div>
  )
}

// Marcador con la forma de la ficha mientras carga la postulación
export function PostulacionDetailSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className={`h-4 w-48 ${skeletonBar}`} />
        <span className={`h-9 w-64 max-w-full ${skeletonBar}`} />
        <span className={`h-5 w-56 max-w-full ${skeletonBar}`} />
      </div>
      <div className={layoutClass}>
        <div className={sectionClass}>
          <span className={`h-6 w-28 ${skeletonBar}`} />
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex flex-1 flex-col gap-2">
                <span className={`h-4 w-20 ${skeletonBar}`} />
                <span className={`h-5 w-3/5 ${skeletonBar}`} />
              </div>
              <span className={`h-11 w-32 ${skeletonBar}`} />
            </div>
          ))}
        </div>
        <div className={sectionClass}>
          <span className={`h-6 w-32 ${skeletonBar}`} />
          <span className={`h-4 w-4/5 ${skeletonBar}`} />
          <span className={`h-11 w-full ${skeletonBar}`} />
        </div>
      </div>
    </div>
  )
}
