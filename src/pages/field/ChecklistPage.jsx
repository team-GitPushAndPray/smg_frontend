import { QrCode, RotateCw, ServerCrash, WifiOff } from 'lucide-react'
import { useCallback } from 'react'
import { useParams } from 'react-router'
import { ChecklistStartSkeleton } from '../../components/field/ChecklistStart'
import ChecklistWizard from '../../components/field/ChecklistWizard'
import FieldMessage from '../../components/field/FieldMessage'
import MainAction from '../../components/field/MainAction'
import ChecklistProvider from '../../context/ChecklistProvider'
import { useFormularioChecklist } from '../../hooks/useFormularioChecklist'
import { enviarChecklist } from '../../services/checklistsService'
import { getDatosEnvio } from '../../utils/checklists'

/*
 * /c/:token: lo que abre el QR pegado en el equipo. Pública, sin sesión y sin navbar, footer ni menú:
 * solo el paso actual. Un token que no es de un equipo activo muestra un aviso sin salidas a otras partes del sistema
 */
export default function ChecklistPage() {
  const { token } = useParams()
  const { status, formulario, retry, refrescar } = useFormularioChecklist(token)
  const enviar = useCallback(
    ({ fotos, ...checklist }) => enviarChecklist(token, { datos: getDatosEnvio(checklist), fotos }),
    [token],
  )

  if (status === 'loading') return <ChecklistStartSkeleton />

  if (status === 'not-found') {
    return (
      <FieldMessage
        icon={QrCode}
        title="Este QR no corresponde a un equipo activo"
        description="Avisale a la oficina."
      />
    )
  }

  if (status === 'offline' || status === 'error') {
    const offline = status === 'offline'
    return (
      <FieldMessage
        role="alert"
        icon={offline ? WifiOff : ServerCrash}
        title={offline ? 'No hay conexión' : 'No pudimos cargar el equipo'}
        description={offline ? 'Buscá un lugar con señal y probá de nuevo.' : 'Probá de nuevo en un rato.'}
        action={<MainAction label="Reintentar" icon={RotateCw} onClick={retry} />}
      />
    )
  }

  return (
    <ChecklistProvider
      key={token}
      clave={token}
      formulario={formulario}
      enviarChecklist={enviar}
      onRefrescar={refrescar}
    >
      <ChecklistWizard />
    </ChecklistProvider>
  )
}
