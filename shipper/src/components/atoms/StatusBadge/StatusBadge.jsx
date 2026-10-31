import { STATUS_META } from '@/app/config/statuses'
import Badge from '@/components/atoms/Badge'
function humanize(key = '') {
  const text = String(key).replace(/[_-]+/g, ' ').trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}
/** Badge driven by the status vocabulary: <StatusBadge status="in_transit" />. Unknown keys render neutral. */
export default function StatusBadge({ status, label, ...rest }) {
  const meta = STATUS_META[status]
  return (
    <Badge tone={meta?.tone ?? 'neutral'} {...rest}>
      {label ?? meta?.label ?? humanize(status)}
    </Badge>
  )
}