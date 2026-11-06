import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { editarCliente } from '../../services/clientesService'
import { getErrorGenerico } from '../../utils/usuarios'
import ConfirmDialog from './ConfirmDialog'

/** @import { Cliente } from '../../types/alquileres' */

const strong = 'font-semibold text-black dark:text-white'
const muted = 'text-sm text-neutral-600 dark:text-neutral-400'

/**
 * Confirmación para desactivar o reactivar un cliente (según su `activo` actual), con PATCH { activo }.
 * Un cliente no se borra: desactivado conserva sus datos y su historial, y solo deja de ofrecerse para alquileres nuevos.
 * Un 400 se muestra en el diálogo, que queda abierto; el resto de los errores va a un aviso.
 * Al terminar llama a `onDone(clienteDelBack)`; el diálogo lo cierra quien lo abrió
 * @param {{ cliente: Cliente, onClose: () => void, onDone: (cliente: Cliente) => void }} props
 */
export default function ClienteEstadoDialog({ cliente, onClose, onDone }) {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const desactivar = cliente.activo

  const onConfirm = async () => {
    setIsSubmitting(true)
    setError('')
    try {
      onDone(await editarCliente(cliente.id, { activo: !desactivar }))
    } catch (err) {
      setIsSubmitting(false)
      if (err.status === 400) {
        setError(err.message)
        return
      }
      const mensaje = getErrorGenerico(err)
      if (mensaje) showToast(mensaje)
    }
  }

  return (
    <ConfirmDialog
      title={desactivar ? '¿Desactivar este cliente?' : '¿Reactivar este cliente?'}
      confirmLabel={desactivar ? 'Desactivar' : 'Reactivar'}
      submittingLabel={desactivar ? 'Desactivando…' : 'Reactivando…'}
      isSubmitting={isSubmitting}
      error={error}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      {desactivar ? (
        <>
          <p>
            <strong className={strong}>{cliente.razon_social}</strong> no se borra: sus datos y su historial de
            alquileres se conservan. Solo deja de aparecer para nuevos alquileres.
          </p>
          <p className={muted}>Podés reactivarlo cuando quieras.</p>
        </>
      ) : (
        <p>
          <strong className={strong}>{cliente.razon_social}</strong> vuelve a aparecer para nuevos alquileres.
        </p>
      )}
    </ConfirmDialog>
  )
}
