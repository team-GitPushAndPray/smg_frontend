import { ArrowLeft, Ban, RotateCw, SearchX, ServerCrash, WifiOff } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import AlquilerChecklistStart, { SalidaAlquiler } from '../../components/field/AlquilerChecklistStart'
import { ChecklistStartSkeleton } from '../../components/field/ChecklistStart'
import ChecklistWizard from '../../components/field/ChecklistWizard'
import FieldMessage from '../../components/field/FieldMessage'
import MainAction from '../../components/field/MainAction'
import { RUTAS_ALQUILERES } from '../../config/rutasPanel'
import ChecklistProvider from '../../context/ChecklistProvider'
import { useAuth } from '../../hooks/useAuth'
import { useFormularioChecklistAlquiler } from '../../hooks/useFormularioChecklistAlquiler'
import { useToast } from '../../hooks/useToast'
import { enviarChecklistAlquiler } from '../../services/alquileresService'
import {
  claveChecklistAlquiler,
  getConflictoChecklistAlquiler,
  nombreCompleto,
  textoChecklistRegistrado,
} from '../../utils/alquileres'
import { borrarBorradores, getCuerpoChecklist } from '../../utils/checklists'

/*
 * /admin/alquileres/:id/equipos/:equipoId/checklist?tipo=ENTREGA|DEVOLUCION (requiere editar Alquileres): entrega o
 * devolución de un equipo del alquiler. Va a pantalla completa, sin el panel, con el mismo asistente del QR (M06):
 * encabezado de solo lectura (equipo, cliente, ubicación y fechas), horas (solo máquinas, precargadas con las actuales),
 * ítems de la plantilla que corresponde, observaciones y foto, revisión y envío. No pide nombre y apellido: el back usa
 * el usuario de la sesión. Al terminar avisa y vuelve al detalle; un 409 (ya se hizo, falta la entrega, el alquiler no
 * está en curso), al entrar o al enviar, muestra por qué con un botón para volver
 */
export default function RentalChecklistPage() {
  const { id, equipoId } = useParams()
  const [searchParams] = useSearchParams()
  const tipo = searchParams.get('tipo')
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { showToast } = useToast()
  const { status, formulario, mensaje, retry } = useFormularioChecklistAlquiler(id, equipoId, tipo)
  // 409 del envío: el checklist ya no se puede hacer (por ejemplo, alguien registró la entrega mientras tanto)
  const [conflictoEnvio, setConflictoEnvio] = useState(/** @type {string | null} */ (null))

  const clave = claveChecklistAlquiler(id, equipoId)
  const detalle = RUTAS_ALQUILERES.detalle(id)
  const volver = useCallback(() => navigate(detalle), [navigate, detalle])
  const horasActuales = formulario?.equipo.horasMotorActual ?? null
  const datosIniciales = useMemo(() => (horasActuales == null ? null : { horas: String(horasActuales) }), [horasActuales])

  const enviar = useCallback(
    ({ tipo: tipoChecklist, fotos, ...checklist }) =>
      enviarChecklistAlquiler(id, equipoId, { tipo: tipoChecklist, datos: getCuerpoChecklist(checklist), fotos }),
    [id, equipoId],
  )

  // Desde el detalle se vuelve con replace: el Atrás del celular no reabre el checklist ya enviado
  const onEnviado = useCallback(() => {
    showToast(textoChecklistRegistrado(tipo, formulario.equipo.codigoInterno), { tipo: 'exito' })
    navigate(detalle, { replace: true })
  }, [showToast, tipo, formulario, navigate, detalle])

  const onErrorEnvio = useCallback(
    (error) => {
      if (error.status !== 409) return false
      borrarBorradores(clave, [tipo])
      setConflictoEnvio(error.message ?? null)
      return true
    },
    [clave, tipo],
  )

  const botonVolver = <MainAction label="Volver al alquiler" icon={ArrowLeft} onClick={volver} />

  if (status === 'loading') return <ChecklistStartSkeleton />

  if (status === 'not-found') {
    return (
      <FieldMessage
        icon={SearchX}
        title="No encontramos este equipo en el alquiler"
        description="Revisá el enlace o entrá desde el detalle del alquiler."
        action={botonVolver}
      />
    )
  }

  if (status === 'conflicto' || conflictoEnvio !== null) {
    const { titulo, descripcion } = getConflictoChecklistAlquiler(tipo, conflictoEnvio ?? mensaje)
    return <FieldMessage role="alert" icon={Ban} title={titulo} description={descripcion} action={botonVolver} />
  }

  if (status === 'offline' || status === 'error') {
    const offline = status === 'offline'
    return (
      <FieldMessage
        role="alert"
        icon={offline ? WifiOff : ServerCrash}
        title={offline ? 'No hay conexión' : 'No pudimos cargar el checklist'}
        description={offline ? 'Buscá un lugar con señal y probá de nuevo.' : 'Probá de nuevo en un rato.'}
        action={
          <>
            <MainAction label="Reintentar" icon={RotateCw} onClick={retry} />
            <button type="button" className="campo-btn-secondary" onClick={volver}>
              Volver al alquiler
            </button>
          </>
        }
      />
    )
  }

  return (
    <ChecklistProvider
      key={`${clave}:${tipo}`}
      clave={clave}
      formulario={formulario}
      datosIniciales={datosIniciales}
      responsable={nombreCompleto(usuario?.nombre, usuario?.apellido) || 'Tu usuario'}
      enviarChecklist={enviar}
      onEnviado={onEnviado}
      onErrorEnvio={onErrorEnvio}
    >
      <ChecklistWizard
        renderInicio={(header) => <AlquilerChecklistStart header={header} alquiler={formulario.alquiler} />}
        salida={<SalidaAlquiler to={detalle} />}
      />
    </ChecklistProvider>
  )
}
