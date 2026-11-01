// Display formatting only. These helpers present values supplied by the backend; they must never be
// used to derive authoritative prices, GST, discounts, shipping, wallet deductions or totals.

const LOCALE = 'en-IN'

const inrFormatters = new Map()
const numberFormatter = new Intl.NumberFormat(LOCALE)

function getInrFormatter(fractionDigits) {
  if (!inrFormatters.has(fractionDigits)) {
    inrFormatters.set(
      fractionDigits,
      new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }),
    )
  }
  return inrFormatters.get(fractionDigits)
}

/** Coerces a number or numeric string (the backend may send decimal strings) to a number, or null. */
export function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/,/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/**
 * Indian rupee display with lakh/crore grouping: ₹4,82,560.
 * decimals: 'auto' shows fraction digits only when needed (cards, tables);
 *           2 forces ₹800.00 (order summaries, reconciliation); 0 rounds for display.
 */
export function formatINR(value, { decimals = 'auto', fallback = '—' } = {}) {
  const amount = toNumber(value)
  if (amount === null) return fallback
  const fractionDigits = decimals === 'auto' ? (Number.isInteger(amount) ? 0 : 2) : decimals
  return getInrFormatter(fractionDigits).format(amount)
}

export function formatNumber(value, { fallback = '—' } = {}) {
  const amount = toNumber(value)
  return amount === null ? fallback : numberFormatter.format(amount)
}

/** Formats a percentage that is already expressed as a percent (20 -> "20%", 12.8 -> "12.8%"). */
export function formatPercent(value, { maximumFractionDigits = 1, fallback = '—' } = {}) {
  const amount = toNumber(value)
  if (amount === null) return fallback
  return `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(amount)}%`
}

export function formatWeightKg(value, { fallback = '—' } = {}) {
  const amount = toNumber(value)
  return amount === null ? fallback : `${amount.toFixed(2).replace(/\.?0+$/, '')} kg`
}

/** pluralize(4, 'unit') -> "4 units"; pluralize(1, 'unit') -> "1 unit". */
export function pluralize(count, singular, plural = `${singular}s`) {
  return `${formatNumber(count)} ${toNumber(count) === 1 ? singular : plural}`
}
