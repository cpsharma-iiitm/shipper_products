import { useFormContext } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/app/store'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import { CHECKOUT_COPY } from '@/features/checkout/lib/checkoutCopy'
import styles from './ContactSection.module.scss'

/** Who the order updates go to. Pre-filled from the signed-in account. */
export default function ContactSection({ compact }) {
  const copy = CHECKOUT_COPY[compact ? 'compact' : 'wide']
  const user = useSelector(selectCurrentUser)
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <Card title={copy.contactTitle} padding={compact ? 'sm' : 'md'}>
      <div className={styles.fields}>
        <FormField label="Full name" error={errors.name?.message}>
          {(control) => <Input {...control} {...register('name')} autoComplete="name" />}
        </FormField>
        <FormField label="Mobile number" error={errors.mobile?.message}>
          {(control) => <Input {...control} {...register('mobile')} type="tel" inputMode="tel" autoComplete="tel" />}
        </FormField>
        <FormField label={copy.emailLabel} error={errors.email?.message} className={styles.full}>
          {(control) => <Input {...control} {...register('email')} type="email" autoComplete="email" />}
        </FormField>
      </div>
      {!compact && (
        <p className={styles.signedIn}>
          <Icon name="check2" /> You’re signed in as {user?.name}
        </p>
      )}
    </Card>
  )
}
