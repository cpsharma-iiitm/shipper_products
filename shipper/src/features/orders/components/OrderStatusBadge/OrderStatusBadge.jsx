import Badge from '@/components/atoms/Badge'
import { getCustomerOrderStatus } from '@/features/orders/constants/orderStatus'

/** The customer-facing status pill of an order: "In Transit", "Delivered", "Returned". */
export default function OrderStatusBadge({ status, ...rest }) {
  const { label, tone } = getCustomerOrderStatus(status)
  return (
    <Badge tone={tone} {...rest}>
      {label}
    </Badge>
  )
}
