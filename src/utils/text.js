// Pasa a minúsculas y quita tildes, para buscar sin importar cómo se escribió ("Excavadora" = "excavadora")
export function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
