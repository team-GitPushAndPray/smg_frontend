import { useContext } from 'react'
import { VendedoresContext } from '../context/VendedoresContext'

export function useVendedores() {
  const context = useContext(VendedoresContext)
  if (!context) {
    throw new Error('useVendedores debe usarse dentro de <VendedoresProvider>')
  }
  return context
}
