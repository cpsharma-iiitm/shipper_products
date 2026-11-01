const IST = 'Asia/Kolkata'

/** "Good morning" / "Good afternoon" / "Good evening" for the hour of `isoTime` in India Standard Time. */
export function getGreeting(isoTime) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: IST }).format(new Date(isoTime)))
  if (hour < 12) return 'Good morning'
  return hour < 17 ? 'Good afternoon' : 'Good evening'
}
