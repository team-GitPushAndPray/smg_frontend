import { QrCode, RotateCw, ServerCrash, WifiOff } from 'lucide-react'
import { useParams } from 'react-router'
import { ChecklistStartSkeleton } from '../../components/field/ChecklistStart'
import ChecklistWizard from '../../components/field/ChecklistWizard'
import FieldMessage from '../../components/field/FieldMessage'
import MainAction from '../../components/field/MainAction'
import ChecklistProvider from '../../context/ChecklistProvider'
import { useFormularioChecklist } from '../../hooks/useFormularioChecklist'

/*
 * /c/:token: lo que abre el QR pegado en el equipo. Pública, sin sesión y sin navbar, footer ni menú:
 * solo el paso actual. Un token que no es de un equipo activo muestra un aviso sin salidas a otras partes del sistema
 */
export default function ChecklistPage() {
  const { token } = useParams()
  const { status, formulario, retry } = useFormularioChecklist(token)

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
    <ChecklistProvider key={token} token={token} formulario={formulario}>
      <ChecklistWizard />
    </ChecklistProvider>
  )
}
