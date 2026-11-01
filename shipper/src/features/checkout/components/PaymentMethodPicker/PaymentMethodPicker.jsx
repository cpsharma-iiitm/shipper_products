import { useId } from 'react'
import clsx from 'clsx'
import { useFormContext, useWatch } from 'react-hook-form'
import { env } from '@/app/config/env'
import Badge from '@/components/atoms/Badge'
import Icon from '@/components/atoms/Icon'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import { PAYMENT_METHODS } from '@/features/checkout/schemas/checkoutSchema'
import { formatINR } from '@/lib/format'
import styles from './PaymentMethodPicker.module.scss'

const METHOD_NOTES = {
  card: 'You’ll enter your card details in the secure Razorpay window.',
  netbanking: 'You’ll choose your bank in the secure Razorpay window.',
}
const COMPACT_UPI_HINT = 'Approve your payment in your UPI app. Card and netbanking options are also available securely.'

/**
 * UPI / Cards / Netbanking choice. Only the UPI ID is typed here; card and netbanking details are entered
 * in the payment window, so this app never handles them. `payable` is the backend quote's "To pay".
 */
export default function PaymentMethodPicker({ compact, payable }) {
  const headingId = useId()
  const {
    register,
    control: formControl,
    formState: { errors },
  } = useFormContext()
  const method = useWatch({ control: formControl, name: 'paymentMethod' })

  return (
    <div className={styles.picker}>
      {!compact && (
        <p id={headingId} className={styles.heading}>
          Choose a payment method · Powered by Razorpay
        </p>
      )}
      <div role="radiogroup" aria-labelledby={compact ? undefined : headingId} aria-label={compact ? 'Payment method' : undefined} className={styles.methods}>
        {PAYMENT_METHODS.map(({ value, label }) => (
          <label key={value} className={clsx(styles.method, method === value && styles.active)}>
            <input type="radio" value={value} className="visually-hidden" {...register('paymentMethod')} />
            <Icon name={method === value ? 'record-circle-fill' : 'circle'} />
            {label}
          </label>
        ))}
      </div>

      {method === 'upi' ? (
        <FormField
          label="UPI ID"
          error={errors.upiId?.message}
          hint={compact ? COMPACT_UPI_HINT : `You’ll approve ${formatINR(payable, { decimals: 2 })} securely in your UPI app.`}
        >
          {(control) => (
            <Input
              {...control}
              {...register('upiId')}
              placeholder="name@bank"
              inputMode="email"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
          )}
        </FormField>
      ) : (
        <p className={styles.note}>{METHOD_NOTES[method]}</p>
      )}

      {env.useMockApi && (
        <p className={styles.mock}>
          <Badge tone="warning" size="sm">
            Test payment (mock)
          </Badge>
          No money moves in this build. A UPI ID starting with fail@ shows a declined payment.
        </p>
      )}
    </div>
  )
}
