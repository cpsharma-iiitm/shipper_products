// Preset date ranges the list and report filters offer. The backend resolves each key against its own
// calendar ("today"), so the browser never does date arithmetic. ASSUMPTION — confirm with backend team: the keys.
const PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
]
 
/** Reports always cover a period. */
export const REPORT_DATE_RANGES = PRESETS
 
/** Lists can also show everything. */
export const LIST_DATE_RANGES = [{ value: 'all', label: 'All time' }, ...PRESETS]