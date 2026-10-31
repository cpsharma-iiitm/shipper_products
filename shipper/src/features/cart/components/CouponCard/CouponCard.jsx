import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import { couponSchema } from '@/features/cart/schemas/couponSchema'
import styles from './CouponCard.module.scss'

// ASSUMPTION — confirm with business team: promotional copy shown under the field.
const COUPON_HINT = 'HELLO10 is valid on your first order. Wallet and coupon offers cannot be combined.'

/**
 * Coupon entry. `code` is the code currently applied to the quote and `coupon` the backend's verdict on it
 * ({ valid, message }); the message is shown as the backend wrote it. Render with `key={code}` so the field
 * starts from the applied code after Apply or Remove.
 */
export default function CouponCard({ code, coupon, applying, onApply, onRemove }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(couponSchema), defaultValues: { code } })

  const verdict = code && !applying ? coupon : null
  const error = errors.code?.message ?? (verdict && !verdict.valid ? verdict.message : undefined)

  return (
    <Card title="Have a little extra savings?">
      <form onSubmit={handleSubmit(({ code: next }) => onApply(next))} noValidate>
        <div aria-live="polite">
          <FormField
            label="Coupon code"
            hint={verdict?.valid ? undefined : COUPON_HINT}
            error={error}
            success={verdict?.valid ? verdict.message : undefined}
          >
            {(control) => (
              <div className={styles.row}>
                <Input {...control} {...register('code')} autoComplete="off" autoCapitalize="characters" placeholder="Enter code" />
                <Button type="submit" variant="secondary" size="sm" loading={applying}>
                  Apply
                </Button>
              </div>
            )}
          </FormField>
        </div>
        {code && (
          <Button variant="link" size="sm" className={styles.remove} onClick={onRemove}>
            Remove coupon
          </Button>
        )}
      </form>
    </Card>
  )
}
