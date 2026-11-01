import { formatDate } from '@/lib/date'
import { formatINR } from '@/lib/format'

const KIND_LABELS = { refund: 'refund', cashback: 'cashback', bonus: 'bonus' }

/** "Last credit: ₹100 refund · 18 Sep 2026" from the wallet summary's `lastCredit`. */
export function describeLastCredit(lastCredit) {
  if (!lastCredit) return 'No credits yet'
  return `Last credit: ${formatINR(lastCredit.amount)} ${KIND_LABELS[lastCredit.kind] ?? 'credit'} · ${formatDate(lastCredit.at)}`
}
