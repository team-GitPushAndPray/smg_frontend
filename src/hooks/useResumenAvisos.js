import { useContext } from 'react'
import { AvisosContext } from '../context/AvisosContext'

export function useResumenAvisos() {
  const context = useContext(AvisosContext)
  if (!context) {
    throw new Error('useResumenAvisos debe usarse dentro de <AvisosProvider>')
  }
  return context
}
