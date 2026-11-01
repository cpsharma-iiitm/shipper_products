import { Link, useParams } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { getOrderHeadline, OrderDetail, OrderDetailSkeleton, useInvoiceDownload, useOrder } from '@/features/orders'
import { AccountShell } from '@/features/profile'
import { formatDateTime } from '@/lib/date'

export default function OrderDetailPage() {
  const { orderNumber } = useParams()
  const { data: order, isPending, isError, error, refetch } = useOrder(orderNumber)
  const invoice = useInvoiceDownload()

  const breadcrumbs = [{ label: 'My account', to: paths.profile }, { label: 'Orders', to: paths.orders }, { label: orderNumber }]
  const shell = { layout: 'wide', showNav: false, breadcrumbs }

  if (isError && error.status === 404) {
    return (
      <AccountShell {...shell} title="We can’t find that order">
        <EmptyState
          icon="bag-x"
          title={`Order ${orderNumber} isn’t on your account`}
          description="Check the order number, or head back to your orders to find it."
          action={
            <Button as={Link} to={paths.orders}>
              Back to my orders
            </Button>
          }
        />
      </AccountShell>
    )
  }
  if (isError) {
    return (
      <AccountShell {...shell} title="Order details">
        <ErrorState title="We couldn’t load this order" message={getErrorMessage(error)} onRetry={refetch} />
      </AccountShell>
    )
  }
  if (isPending) {
    return (
      <AccountShell {...shell} title="Order details" description={`Order #${orderNumber}`}>
        <OrderDetailSkeleton />
      </AccountShell>
    )
  }

  return (
    <AccountShell
      {...shell}
      title={getOrderHeadline(order.status)}
      description={`Order #${order.orderNumber} · Placed ${formatDateTime(order.placedAt).replace(', ', ' at ')}`}
      actions={
        order.invoiceNumber && (
          <Button size="lg" loading={invoice.isPending} onClick={() => invoice.mutate(order.orderNumber)}>
            Download invoice
          </Button>
        )
      }
    >
      <OrderDetail order={order} />
    </AccountShell>
  )
}
