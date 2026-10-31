import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Select from '@/components/atoms/Select'
import Alert from '@/components/molecules/Alert'
import FormField from '@/components/molecules/FormField'
import Modal from '@/components/organisms/Modal'
import { CANCEL_REASON_OPTIONS } from '@/features/admin-orders/constants/orderOptions'
import { useCancelOrder } from '@/features/admin-orders/hooks/useAdminOrders'
import { cancelOrderSchema } from '@/features/admin-orders/schemas/cancelOrderSchema'
import { formatINR } from '@/lib/format'
import styles from './CancelOrderModal.module.scss'
 
const FORM_ID = 'cancel-order-form'
const money = (value) => formatINR(value, { decimals: 2 })
 
function CancelForm({ order, cancel, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(cancelOrderSchema), defaultValues: { reason: '' } })
 
  const onSubmit = handleSubmit(({ reason }) =>
    cancel.mutate(
      { orderNumber: order.orderNumber, reason },
      {
        onSuccess: () => {
          toast.success(`Order ${order.orderNumber} was cancelled.`)
          onClose()
        },
        onError: (error) => toast.error(error.message),
      },
    ),
  )
 
  return (
    <form id={FORM_ID} className={styles.form} onSubmit={onSubmit} noValidate>
      {order.paymentStatus === 'paid' ? (
        <Alert tone="info">
          {money(order.summary.payable)} goes back to the customer&rsquo;s original payment method
          {order.summary.walletApplied > 0 && `, and ${money(order.summary.walletApplied)} returns to their wallet`}. The refund is recorded on the order.
        </Alert>
      ) : (
        <Alert tone="info">No payment was received for this order, so nothing needs to be refunded.</Alert>
      )}
      <FormField label="Reason" required error={errors.reason?.message}>
        {(field) => (
          <Select {...field} {...register('reason')}>
            <option value="">Choose a reason</option>
            {CANCEL_REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}
      </FormField>
    </form>
  )
}
 
/** Cancel dialog for a new or to-pick order. The backend decides whether the cancellation is allowed. */
export default function CancelOrderModal({ order, open, onClose }) {
  const cancel = useCancelOrder()
 
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={`Cancel order ${order.orderNumber}?`}
      description="Orders can only be cancelled before they are packed."
      closeOnBackdrop={!cancel.isPending}
      closeOnEscape={!cancel.isPending}
      footer={
        <>
          <Button variant="secondary" disabled={cancel.isPending} onClick={onClose}>
            Keep order
          </Button>
          <Button type="submit" form={FORM_ID} variant="danger" loading={cancel.isPending}>
            Cancel order
          </Button>
        </>
      }
    >
      <CancelForm order={order} cancel={cancel} onClose={onClose} />
    </Modal>
  )
}