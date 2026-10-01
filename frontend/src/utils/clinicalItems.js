// Normalizes condition / medication entries from the backend.
// Fields are not strictly typed by the API contract (they may be plain
// strings or FHIR-shaped objects), so this extracts a readable label and
// an optional secondary detail line without assuming a fixed shape.

export function itemLabel(item) {
  if (item === null || item === undefined || item === '') return 'Not available'
  if (typeof item === 'string') return item
  if (typeof item === 'object') {
    return (
      item.text ||
      item.display ||
      item.name ||
      item.medication ||
      item.description ||
      item.code ||
      'Not available'
    )
  }
  return String(item)
}

export function itemDetail(item) {
  if (typeof item !== 'object' || item === null) return null
  const parts = [item.dosage, item.dose, item.frequency, item.status, item.onsetDate].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
}
