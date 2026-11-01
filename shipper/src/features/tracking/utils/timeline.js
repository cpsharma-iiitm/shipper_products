import { formatShortDateTime } from '@/lib/date'

/**
 * Turns the backend's customer timeline into what the Timeline component renders.
 *   [{ key, title, at, note, state }] → [{ key, title, timestamp: "24 Oct, 10:42 AM · Payment received", status }]
 * Steps that have not happened yet have no time, so only their note ("Expected 29 Oct") is shown.
 */
export function toTimelineItems(timeline) {
  return timeline.map(({ key, title, at, note, state }) => ({
    key,
    title,
    timestamp: [at ? formatShortDateTime(at) : null, note].filter(Boolean).join(' · '),
    status: state,
  }))
}
