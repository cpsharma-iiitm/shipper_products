import { toNumber } from '@/lib/format'

/** "0.85 kg", "1.20 kg": a parcel weight always shows two decimals on the dispatch screens. */
export function formatParcelWeight(weightKg) {
  const value = toNumber(weightKg)
  return value === null ? '—' : `${value.toFixed(2)} kg`
}

/** "24 × 18 × 12 cm" */
export function formatDimensions({ length, width, height } = {}) {
  return `${length} × ${width} × ${height} cm`
}
