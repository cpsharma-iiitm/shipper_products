// DEV FIXTURES — helpers shared by the admin module mock handlers (reports, customers, users, orders, restock).
// The real backend owns date ranges, paging and filtering; every shape here is an ASSUMPTION — confirm with backend team.
import { MockHttpError } from '@/mocks/adapter'
import { FIXTURE_NOW } from '@/mocks/fixtures/clock'
import { paginate } from '@/mocks/lib/paginate'
 
const IST = 'Asia/Kolkata'
const DAY_MS = 86_400_000
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
 
/** The calendar day (YYYY-MM-DD, India time) of a timestamp. */
export const istDate = (value) => new Date(value).toLocaleDateString('en-CA', { timeZone: IST })
 
/** "Today" for the fixture clock. */
export const TODAY = istDate(FIXTURE_NOW)
 
/** The fixture clock as an ISO timestamp, for records the handlers create. */
export const nowIso = () => new Date(FIXTURE_NOW).toISOString()
 
const toUtc = (iso) => {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}
const toIso = (date) => date.toISOString().slice(0, 10)
 
export const addDays = (iso, days) => toIso(new Date(toUtc(iso).getTime() + days * DAY_MS))
 
export function addMonths(iso, months) {
  const date = toUtc(iso)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + months)
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
  date.setUTCDate(Math.min(day, lastDay))
  return toIso(date)
}
 
const monthStart = (iso) => `${iso.slice(0, 8)}01`
const monthEnd = (iso) => addDays(addMonths(monthStart(iso), 1), -1)
 
export const daysBetween = (from, to) => Math.round((toUtc(to) - toUtc(from)) / DAY_MS)
 
/** Every calendar day from `from` to `to` inclusive. */
export const eachDay = (from, to) => Array.from({ length: daysBetween(from, to) + 1 }, (_, index) => addDays(from, index))
 
export const monthLabel = (iso) => toUtc(iso).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
 
const PRESETS = {
  today: () => [TODAY, TODAY],
  yesterday: () => [addDays(TODAY, -1), addDays(TODAY, -1)],
  last_7_days: () => [addDays(TODAY, -6), TODAY],
  last_30_days: () => [addDays(TODAY, -29), TODAY],
  this_month: () => [monthStart(TODAY), TODAY],
  last_month: () => [monthStart(addMonths(TODAY, -1)), monthEnd(addMonths(TODAY, -1))],
}
 
/**
 * Turns the `range` preset (or `range=custom` with `from` and `to`) of a query into
 * { preset, from, to }, or null for `range=all`. The backend, not the browser, knows what "today" is.
 */
export function resolveRange({ range, from, to }, fallback) {
  const key = range || fallback
  if (key === 'all') return null
  if (key === 'custom') {
    if (!ISO_DATE.test(from ?? '') || !ISO_DATE.test(to ?? '')) throw new MockHttpError(422, 'Choose both a start and an end date.')
    if (from > to) throw new MockHttpError(422, 'The start date must be on or before the end date.')
    return { preset: 'custom', from, to }
  }
  const preset = PRESETS[key]
  if (!preset) throw new MockHttpError(422, 'Unknown date range.')
  const [start, end] = preset()
  return { preset: key, from: start, to: end }
}
 
export const inRange = (timestamp, range) => {
  if (!range) return true
  const day = istDate(timestamp)
  return day >= range.from && day <= range.to
}
 
/** The paging envelope every admin list returns. */
export function listResponse(items, query, extra = {}, defaultPageSize = 10) {
  return { ...paginate(items, { page: query.page, pageSize: query.pageSize ?? defaultPageSize }), ...extra }
}
