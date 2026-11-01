import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)

// Shipper operates from India: order, packing and dispatch times are shown in IST for every viewer.
export const DISPLAY_TIME_ZONE = 'Asia/Kolkata'

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function toDisplayDate(value) {
  if (value === null || value === undefined || value === '') return null
  // Date-only strings carry no time zone; converting them would shift the calendar day.
  const parsed = typeof value === 'string' && DATE_ONLY.test(value) ? dayjs(value) : dayjs(value).tz(DISPLAY_TIME_ZONE)
  return parsed.isValid() ? parsed : null
}

function formatWith(pattern) {
  return (value, fallback = '—') => {
    const date = toDisplayDate(value)
    return date ? date.format(pattern) : fallback
  }
}

/** 24 Oct 2026 */
export const formatDate = formatWith('DD MMM YYYY')
/** 24 Oct */
export const formatShortDate = formatWith('DD MMM')
/** 10:42 AM */
export const formatTime = formatWith('hh:mm A')
/** 24 Oct 2026, 10:42 AM */
export const formatDateTime = formatWith('DD MMM YYYY, hh:mm A')
/** 24 Oct, 10:42 AM (timelines) */
export const formatShortDateTime = formatWith('DD MMM, hh:mm A')
/** Thursday, 29 October */
export const formatLongDate = formatWith('dddd, D MMMM')

/** 01 Oct – 28 Oct 2026 */
export function formatDateRange(from, to, fallback = '—') {
  const start = toDisplayDate(from)
  const end = toDisplayDate(to)
  if (!start || !end) return fallback
  if (start.isSame(end, 'day')) return end.format('DD MMM YYYY')
  if (start.isSame(end, 'year')) return `${start.format('DD MMM')} – ${end.format('DD MMM YYYY')}`
  return `${start.format('DD MMM YYYY')} – ${end.format('DD MMM YYYY')}`
}
