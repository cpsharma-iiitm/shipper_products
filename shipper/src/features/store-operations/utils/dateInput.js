import { DISPLAY_TIME_ZONE } from '@/lib/date'

// <input type="datetime-local"> holds a wall-clock value without a zone. Store operation works in
// India time (DISPLAY_TIME_ZONE), which has no daylight saving, so the offset is a constant.
const IST_OFFSET = '+05:30'
const formatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: DISPLAY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** "2026-10-29T12:00:00+05:30" → "2026-10-29T12:00" (empty for a missing or invalid date). */
export function toDateTimeInput(iso) {
  if (!iso || Number.isNaN(Date.parse(iso))) return ''
  return formatter.format(new Date(iso)).replace(' ', 'T')
}

/** "2026-10-29T12:00" → "2026-10-29T12:00:00+05:30". */
export const fromDateTimeInput = (value) => (value ? `${value}:00${IST_OFFSET}` : null)
