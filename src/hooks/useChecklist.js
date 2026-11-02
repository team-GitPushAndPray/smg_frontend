import { useContext } from 'react'
import { ChecklistContext } from '../context/ChecklistContext'

export function useChecklist() {
  const context = useContext(ChecklistContext)
  if (!context) {
    throw new Error('useChecklist debe usarse dentro de <ChecklistProvider>')
  }
  return context
}
