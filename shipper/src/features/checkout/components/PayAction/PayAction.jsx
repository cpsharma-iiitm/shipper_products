import { useId } from 'react'
import { getErrorMessage } from '@/app/services'
import Alert from '@/components/molecules/Alert'
import Button from '@/components/atoms/Button'
import { PaymentError } from '@/features/checkout/services/paymentService'
import { formatINR } from '@/lib/format'
import styles from './PayAction.module.scss'

/**
 * The Pay button with what can go wrong around it: the reason it is unavailable (`blocker`, shown as text;
 * `disabled` covers the silent cases such as a quote that is still loading) and the last failed attempt
 * (`error`). The amount is the backend quote's "To pay".
 */
export default function PayAction({ payable, loading, disabled, blocker, error }) {
  const blockerId = useId()
  const failedPayment = error instanceof PaymentError

  return (
    <div className={styles.action}>
      {error && (
        <Alert tone="danger" title={failedPayment ? 'Your payment didn’t go through' : 'We couldn’t place your order'}>
          {failedPayment ? error.message : getErrorMessage(error)}
        </Alert>
      )}
      <Button type="submit" size="lg" leftIcon="lock" loading={loading} disabled={disabled || Boolean(blocker)} aria-describedby={blocker ? blockerId : undefined}>
        {loading ? 'Processing payment…' : `Pay ${formatINR(payable)} securely`}
      </Button>
      {blocker && (
        <p id={blockerId} className={styles.blocker}>
          {blocker}
        </p>
      )}
    </div>
  )
}
