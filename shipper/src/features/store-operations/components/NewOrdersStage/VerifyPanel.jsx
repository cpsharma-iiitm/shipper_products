import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Alert from '@/components/molecules/Alert'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import StatusBadge from '@/components/atoms/StatusBadge'
import SummaryRows from '@/components/molecules/SummaryRows'
import ConfirmDialog from '@/components/organisms/ConfirmDialog'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatDate, formatTime } from '@/lib/date'
import { formatINR, pluralize } from '@/lib/format'
import WorkPanel, { PanelNote, PanelSection } from '@/features/store-operations/components/WorkPanel'
import { useHoldOrder, useVerifyOrder } from '@/features/store-operations/hooks/useFulfilmentActions'
import { useWorkOrder } from '@/features/store-operations/hooks/useStoreOperations'
import styles from './VerifyPanel.module.scss'

const PAYMENT_BADGES = {
  paid: (id) => (
    <Badge tone="success" className="align-self-start">
      {id ? `Verified · ${id}` : 'Verified'}
    </Badge>
  ),
  pending: () => (
    <Badge tone="warning" className="align-self-start">
      Payment pending
    </Badge>
  ),
  failed: () => (
    <Badge tone="danger" className="align-self-start">
      Payment failed
    </Badge>
  ),
}

function PaymentVerification({ order }) {
  const { payment } = order
  const rows = [{ label: `Razorpay · ${payment.method}`, value: formatINR(payment.paid, { decimals: 2 }) }]
  if (payment.walletApplied > 0) rows.push({ label: 'Wallet applied', value: formatINR(payment.walletApplied, { decimals: 2 }) })
  const renderBadge = PAYMENT_BADGES[payment.status]

  return (
    <PanelSection title="Payment verification">
      <SummaryRows rows={rows} />
      {renderBadge ? renderBadge(payment.razorpayPaymentId) : <StatusBadge status={payment.status} className="align-self-start" />}
    </PanelSection>
  )
}

function StockCheck({ order }) {
  const { lines, stock, summary } = order
  const shortCodes = new Set(stock.shortages.map((shortage) => shortage.productCode))

  return (
    <PanelSection title={`Stock check · ${pluralize(summary.units, 'unit')}`} divided>
      <table className={styles.stock}>
        <caption className="visually-hidden">Stock needed against stock available</caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Need</th>
            <th scope="col">Available</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.productCode}>
              <td>
                {line.productCode} · {line.name}
              </td>
              <td>{line.quantity}</td>
              <td className={shortCodes.has(line.productCode) ? styles.short : undefined}>
                {line.available} <Icon name={shortCodes.has(line.productCode) ? 'x-lg' : 'check2'} label={shortCodes.has(line.productCode) ? 'Short' : 'Enough'} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {stock.allAvailable ? (
        <PanelNote tone="success">
          <Icon name="check2" /> All items available in {stock.warehouse.split(' · ')[0]} warehouse.
        </PanelNote>
      ) : (
        <PanelNote tone="danger">
          Short on {pluralize(stock.shortages.length, 'item')}. The picker will need to report a discrepancy.
        </PanelNote>
      )}
    </PanelSection>
  )
}

function AddressCheck({ order }) {
  const { address, customer } = order
  return (
    <PanelNote>
      Deliver to {customer.name} · {address.city} {address.pin}. {address.verified ? 'PIN and address verified.' : 'The address has not been verified yet.'}
    </PanelNote>
  )
}

/** The Verify panel: payment, stock and address checks for one new order, then release it to the warehouse. */
export default function VerifyPanel({ orderNumber, onDone }) {
  const query = useWorkOrder(orderNumber)
  const verify = useVerifyOrder()
  const hold = useHoldOrder()
  const holdDialog = useDisclosure()

  const verifyOrder = () =>
    verify.mutate(orderNumber, {
      onSuccess: () => {
        toast.success(`${orderNumber} verified and moved to To Pick.`)
        onDone()
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })

  const holdOrder = () =>
    hold.mutate(orderNumber, {
      onSuccess: () => {
        toast.success(`${orderNumber} is on hold and listed under Delayed Orders.`)
        holdDialog.close()
      },
      onError: (error) => {
        holdDialog.close()
        toast.error(getErrorMessage(error))
      },
    })

  return (
    <WorkPanel
      title={orderNumber ? `Verify #${orderNumber}` : 'Verify order'}
      orderNumber={orderNumber}
      query={query}
      emptyTitle="Select an order"
      emptyDescription="Choose an order from the list to verify its payment and stock."
    >
      {(order) => {
        const cannotVerify = order.stage !== 'new' || order.onHold || order.payment.status !== 'paid'
        return (
          <>
            <div className={styles.meta}>
              <p className={styles.placed}>
                {formatDate(order.placedAt)} · {formatTime(order.placedAt)}
              </p>
              <StatusBadge status={order.stage === 'new' ? 'new' : order.status} />
            </div>

            {order.onHold && (
              <Alert tone="warning" className={styles.alert} action={<Link to={paths.admin.storeTab('delayed')}>View exception</Link>}>
                This order is on hold. Resolve the exception before verifying it.
              </Alert>
            )}

            <PaymentVerification order={order} />
            <StockCheck order={order} />
            <PanelSection>
              <AddressCheck order={order} />
            </PanelSection>

            <div className={styles.actions}>
              <Button size="lg" rightIcon="arrow-right" disabled={cannotVerify} loading={verify.isPending} onClick={verifyOrder}>
                Verify &amp; move to To Pick
              </Button>
              {order.payment.status !== 'paid' && <PanelNote tone="warning">Payment is {order.payment.status}. Verify once it is confirmed.</PanelNote>}
              {!order.onHold && order.stage === 'new' && (
                <Button variant="link" className={styles.hold} onClick={holdDialog.open}>
                  Put order on hold
                </Button>
              )}
            </div>

            <ConfirmDialog
              open={holdDialog.isOpen}
              onClose={holdDialog.close}
              onConfirm={holdOrder}
              loading={hold.isPending}
              title={`Put ${order.orderNumber} on hold?`}
              message="The order stays in New Orders but is flagged as delayed until someone resolves it under Delayed Orders."
              confirmLabel="Put on hold"
            />
          </>
        )
      }}
    </WorkPanel>
  )
}
