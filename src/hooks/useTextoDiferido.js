import { useEffect, useRef, useState } from 'react'

// Espera desde la última tecla antes de aplicar lo escrito, para no consultar al back con cada letra
export const ESPERA_BUSQUEDA = 400

/*
 * Campo de texto que se aplica con espera (buscador, responsable). `valorAplicado` es el que ya está en la URL y
 * `aplicar` recibe el texto nuevo, sin espacios en los bordes. Devuelve:
 * - `texto`: lo escrito, para el value del input;
 * - `cambiar`: para el onChange; aplica recién cuando se deja de tipear. Un espacio de más no cuenta como cambio;
 * - `borrar`: vacía el campo y lo aplica al momento (la ✕ del buscador);
 * - `descartar`: vacía el campo sin aplicar nada (antes de "Limpiar filtros", que ya limpia la URL).
 * Si el valor aplicado cambia por otro lado (un enlace, "Limpiar filtros"), el campo se pone al día
 */
export function useTextoDiferido(valorAplicado, aplicar, espera = ESPERA_BUSQUEDA) {
  const [texto, setTexto] = useState(valorAplicado)
  const [ultimoAplicado, setUltimoAplicado] = useState(valorAplicado)
  const timer = useRef(null)

  if (valorAplicado !== ultimoAplicado) {
    setUltimoAplicado(valorAplicado)
    if (valorAplicado !== texto.trim()) setTexto(valorAplicado)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  const cambiar = (valor) => {
    setTexto(valor)
    clearTimeout(timer.current)
    if (valor.trim() === valorAplicado) return
    timer.current = setTimeout(() => aplicar(valor.trim()), espera)
  }

  const descartar = () => {
    clearTimeout(timer.current)
    setTexto('')
  }

  const borrar = () => {
    descartar()
    aplicar('')
  }

  return { texto, cambiar, borrar, descartar }
}
