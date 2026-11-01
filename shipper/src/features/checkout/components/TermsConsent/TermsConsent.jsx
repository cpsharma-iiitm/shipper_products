import { useId } from 'react'
import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import Checkbox from '@/components/atoms/Checkbox'
import styles from './TermsConsent.module.scss'

/** Required consent. Starts unchecked: the customer has to agree before an order can be placed. */
export default function TermsConsent({ compact }) {
  const errorId = useId()
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const error = errors.acceptTerms?.message

  return (
    <div className={styles.terms}>
      <Checkbox
        invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        label={
          <>
            I agree to the{' '}
            <Link to={paths.policy('terms')} target="_blank" rel="noopener">
              terms of sale
            </Link>{' '}
            and{' '}
            <Link to={paths.policy('privacy')} target="_blank" rel="noopener">
              privacy policy
            </Link>
            .{!compact && ' Your payment details are encrypted and never stored by Shipper.com.'}
          </>
        }
        {...register('acceptTerms')}
      />
      {error && (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
