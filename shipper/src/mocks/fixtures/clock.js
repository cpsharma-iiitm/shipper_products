// DEV FIXTURE: a fixed "now" so dates match the design (28 Oct 2026) whenever the demo is opened.
export const FIXTURE_NOW = '2026-10-28T11:30:00+05:30'

/** ISO timestamp `days` days, `hours` hours and `minutes` minutes before the fixture clock. */
export function ago({ days = 0, hours = 0, minutes = 0 } = {}) {
  const date = new Date(FIXTURE_NOW)
  date.setMinutes(date.getMinutes() - (days * 24 * 60 + hours * 60 + minutes))
  return date.toISOString()
}

/** ISO timestamp `days` days and `hours` hours after the fixture clock. */
export function fromNow({ days = 0, hours = 0 } = {}) {
  const date = new Date(FIXTURE_NOW)
  date.setMinutes(date.getMinutes() + (days * 24 * 60 + hours * 60))
  return date.toISOString()
}
