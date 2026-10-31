import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import StatusBadge from '@/components/atoms/StatusBadge'
import AddressSummary from '@/components/molecules/AddressSummary'
import SummaryRows from '@/components/molecules/SummaryRows'
import { CANCEL_REASON_OPTIONS } from '@/features/admin-orders/constants/orderOptions'
import { formatMobile } from '@/lib/address'
import { formatDateTime } from '@/lib/date'
import { formatINR } from '@/lib/format'
import styles from './OrderSidePanels.module.scss'
 
const money = (value) => formatINR(value, { decimals: 2 })
const dash = (value) => value || '—'
 
function Customer({ order }) {
  return (
    <Card title="Customer" padding="md" radius="md">
      <SummaryRows
        rows={[
          { label: 'Name', value: <Link to={paths.admin.customer(order.customerCode)} className={styles.link}>{order.customerName}</Link> },
          { label: 'Customer code', value: order.customerCode },
          { label: 'Mobile', value: formatMobile(order.customerMobile) },
          { label: 'Email', value: order.customerEmail },
        ]}
      />
    </Card>
  )
}
 
function Delivery({ order }) {
  return (
    <Card title="Delivery address" padding="md" radius="md" actions={order.address.label && <Badge tone="info">{order.address.label}</Badge>}>
      <AddressSummary address={order.address} includeLandmark />
      {order.deliveryInstructions && <p className={styles.note}>Note: {order.deliveryInstructions}</p>}
    </Card>
  )
}
 
function Payment({ order }) {
  return (
    <Card title="Payment" padding="md" radius="md">
      <SummaryRows
        rows={[
          { label: 'Status', value: <StatusBadge status={order.paymentStatus} /> },
          { label: 'Method', value: `${order.paymentMethod} via Razorpay` },
          { label: 'Razorpay payment ID', value: dash(order.razorpayPaymentId) },
          { label: 'Invoice', value: dash(order.invoiceNumber) },
        ]}
      />
    </Card>
  )
}
 
function Fulfilment({ order }) {
  const f = order.fulfilment
  return (
    <Card title="Fulfilment" padding="md" radius="md">
      <SummaryRows
        rows={[
          { label: 'Warehouse', value: f.warehouse },
          { label: 'Assigned to', value: dash(f.assignee) },
          { label: 'Pick batch', value: dash(f.pickBatch) },
          { label: 'Priority', value: <StatusBadge status={f.priority} /> },
          { label: 'Packed by', value: dash(f.packedBy) },
          { label: 'Packaging', value: dash(f.packaging) },
        ]}
      />
      {order.fulfilmentTab && (
        <Button as={Link} to={paths.admin.storeTab(order.fulfilmentTab)} variant="secondary" size="sm" rightIcon="arrow-right" className={styles.action}>
          Open in Store Operation
        </Button>
      )}
    </Card>
  )
}
 
function Refund({ refund }) {
  const reason = CANCEL_REASON_OPTIONS.find((option) => option.value === refund.reason)?.label
  return (
    <Card title="Refund" padding="md" radius="md">
      <SummaryRows
        rows={[
          { label: 'Amount', value: money(refund.amount) },
          { label: 'Refunded to', value: refund.to === 'wallet' ? 'Shipper wallet' : refund.to },
          ...(refund.walletAmount > 0 ? [{ label: 'Wallet part returned', value: money(refund.walletAmount) }] : []),
          { label: 'Date', value: formatDateTime(refund.at) },
          ...(reason ? [{ label: 'Reason', value: reason }] : []),
        ]}
      />
    </Card>
  )
}
 
/** The right-hand column of the order detail: customer, address, payment, fulfilment and (if any) refund. */
export default function OrderSidePanels({ order }) {
  return (
    <div className={styles.stack}>
      <Customer order={order} />
      <Delivery order={order} />
      <Payment order={order} />
      <Fulfilment order={order} />
      {order.refund && <Refund refund={order.refund} />}
    </div>
  )
}