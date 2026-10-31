import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Skeleton from '@/components/atoms/Skeleton'
import StatusBadge from '@/components/atoms/StatusBadge'
import Alert from '@/components/molecules/Alert'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import CancelOrderModal from '@/features/admin-orders/components/CancelOrderModal'
import OrderItemsCard from '@/features/admin-orders/components/OrderItemsCard'
import OrderShipmentCard from '@/features/admin-orders/components/OrderShipmentCard'
import OrderSidePanels from '@/features/admin-orders/components/OrderSidePanels'
import OrderSummaryCard from '@/features/admin-orders/components/OrderSummaryCard'
import { useAdminOrder } from '@/features/admin-orders/hooks/useAdminOrders'
import { downloadInvoice } from '@/features/orders'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatDate, formatTime } from '@/lib/date'
import styles from './OrderDetail.module.scss'

function DetailSkeleton() {
  return (
    <div className={styles.columns} aria-busy="true" aria-label="Loading order">
      <div className={styles.stack}>
        <Skeleton height="14rem" radius="var(--sh-radius-md)" />
        <Skeleton height="16rem" radius="var(--sh-radius-md)" />
      </div>
      <div className={styles.stack}>
        <Skeleton height="10rem" radius="var(--sh-radius-md)" />
        <Skeleton height="10rem" radius="var(--sh-radius-md)" />
      </div>
    </div>
  )
}

/**
 * Admin order detail. Read-only apart from cancelling a new or to-pick order; verify, pick, pack and
 * dispatch stay in Store Operation (linked from the fulfilment panel).
 */
export default function OrderDetail({ orderNumber }) {
  const { data: order, isPending, isError, error, refetch } = useAdminOrder(orderNumber)
  const cancelDialog = useDisclosure()
  const invoice = useMutation({
    mutationFn: downloadInvoice,
    onError: (failure) => toast.error(getErrorMessage(failure, 'We could not download the invoice. Please try again.')),
  })

  return (
    <div className={styles.page}>
      <PageHeader
        title={`Order ${orderNumber}`}
        description={order ? `Placed ${formatDate(order.placedAt)} at ${formatTime(order.placedAt)} · ${order.channel === 'web' ? 'Website' : order.channel}` : undefined}
        actions={
          <>
            <Button as={Link} to={paths.admin.orders} variant="secondary" size="sm" leftIcon="arrow-left">
              All orders
            </Button>
            <Button variant="secondary" size="sm" leftIcon="download" disabled={!order} loading={invoice.isPending} onClick={() => invoice.mutate(orderNumber)}>
              Download invoice
            </Button>
            {order?.canCancel && (
              <Button variant="danger" size="sm" onClick={cancelDialog.open}>
                Cancel order
              </Button>
            )}
          </>
        }
      />

      {isError && (
        <ErrorState
          title="We could not open this order"
          message={getErrorMessage(error)}
          onRetry={error.status === 404 ? undefined : refetch}
        />
      )}

      {isPending && <DetailSkeleton />}

      {order && (
        <>
          <div className={styles.statusRow}>
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} label={`Payment ${order.paymentStatus === 'paid' ? 'received' : order.paymentStatus}`} />
            {order.onHold && <Badge tone="warning">On hold</Badge>}
          </div>

          {order.delay && (
            <Alert
              tone="warning"
              title={`Delayed: ${order.delay.label}`}
              action={
                <Button as={Link} to={paths.admin.storeTab('delayed')} variant="secondary" size="sm">
                  Resolve in Store Operation
                </Button>
              }
            >
              {order.delay.detail}
            </Alert>
          )}

          <div className={styles.columns}>
            <div className={styles.stack}>
              <OrderItemsCard lines={order.lines} />
              <OrderSummaryCard summary={order.summary} paymentStatus={order.paymentStatus} />
              <OrderShipmentCard shipment={order.shipment} timeline={order.timeline} />
            </div>
            <OrderSidePanels order={order} />
          </div>

          <CancelOrderModal order={order} open={cancelDialog.isOpen} onClose={cancelDialog.close} />
        </>
      )}
    </div>
  )
}
