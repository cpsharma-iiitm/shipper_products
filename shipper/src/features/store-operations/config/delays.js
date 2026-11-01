// Vocabulary for the exception queue. The values are the API's enums; the labels are display copy.

/** What the resolution owner has decided to do about a delayed order. */
export const DELAY_ACTIONS = [
  { value: 'wait_for_restock', label: 'Wait for restock' },
  { value: 'contact_carrier', label: 'Contact carrier' },
  { value: 'notify_customer', label: 'Notify customer' },
  { value: 'verify_address', label: 'Verify address' },
  { value: 'reschedule_pickup', label: 'Reschedule pickup' },
]

/** Issue groups: the summary cards, the "Issue" filter and the panel badge all use them. */
export const ISSUE_GROUPS = [
  { key: 'payment', cardLabel: 'Payment issues', badgeLabel: 'Payment issue', cardTone: 'warning', badgeTone: 'warning' },
  { key: 'stock', cardLabel: 'Stock shortage', badgeLabel: 'Stock shortage', cardTone: 'danger', badgeTone: 'danger' },
  { key: 'shipping', cardLabel: 'Shipping delay', badgeLabel: 'Shipping delay', cardTone: 'warning', badgeTone: 'warning' },
  { key: 'address', cardLabel: 'Address issue', badgeLabel: 'Address issue', cardTone: 'info', badgeTone: 'info' },
]

export const OTHER_ISSUE = { key: 'other', cardLabel: 'On hold', badgeLabel: 'On hold', cardTone: 'neutral', badgeTone: 'warning' }

export const findIssueGroup = (key) => ISSUE_GROUPS.find((group) => group.key === key) ?? OTHER_ISSUE

export const PRIORITY_LABELS = { standard: 'Standard', medium: 'Medium', high: 'High', critical: 'Critical' }
