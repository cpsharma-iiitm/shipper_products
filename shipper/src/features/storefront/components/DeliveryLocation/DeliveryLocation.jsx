import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { z } from 'zod'
import { getErrorMessage } from '@/app/services'
import { deliveryLocationSet, selectDeliveryLocation } from '@/app/store'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import Popover from '@/components/molecules/Popover'
import { useServiceabilityCheck } from '@/features/storefront/hooks/useServiceabilityCheck'
import { pinCodeSchema } from '@/lib/validation'
import clsx from 'clsx'
import styles from './DeliveryLocation.module.scss'

const schema = z.object({ pin: pinCodeSchema })

function PinForm({ onDone }) {
  const dispatch = useDispatch()
  const check = useServiceabilityCheck()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { pin: '' } })

  const submit = ({ pin }) =>
    check.mutate(pin, {
      onSuccess: (result) => {
        if (!result.serviceable) return
        dispatch(deliveryLocationSet({ pin: result.pin, city: result.city }))
        onDone()
      },
    })

  const notServiceable = check.data && !check.data.serviceable
  const serverError = check.isError ? getErrorMessage(check.error) : null

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
      <FormField
        label="Delivery PIN code"
        hint="We'll show delivery options for this address."
        error={errors.pin?.message ?? serverError ?? (notServiceable ? "We don't deliver to this PIN code yet." : undefined)}
      >
        {(control) => (
          <div className={styles.row}>
            <Input {...control} size="md" inputMode="numeric" maxLength={6} placeholder="e.g. 226010" autoComplete="postal-code" {...register('pin')} />
            <Button type="submit" size="md" loading={check.isPending}>
              Check
            </Button>
          </div>
        )}
      </FormField>
    </form>
  )
}

/**
 * "Deliver to Lucknow 226010" control. The chosen PIN is a UI preference (Redux `ui`), confirmed
 * against the backend serviceability check. variant: header (two-line, desktop) | inline (mobile).
 */
export default function DeliveryLocation({ variant = 'header' }) {
  const location = useSelector(selectDeliveryLocation)

  return (
    <Popover
      align={variant === 'header' ? 'end' : 'start'}
      panelClassName={styles.panel}
      trigger={({ props, isOpen }) =>
        variant === 'header' ? (
          <button type="button" className={clsx(styles.headerTrigger, isOpen && styles.open)} {...props}>
            <span className={styles.small}>{location ? `Deliver to ${location.city}` : 'Deliver to'}</span>
            <span className={styles.pin}>
              {location?.pin ?? 'Select PIN'}
              <Icon name="chevron-down" />
            </span>
          </button>
        ) : (
          <button type="button" className={styles.inlineTrigger} {...props}>
            <Icon name="geo-alt" />
            {location ? `Deliver to ${location.city} ${location.pin}` : 'Select delivery PIN'}
            <span aria-hidden="true"> · </span>
            <span className={styles.change}>Change</span>
          </button>
        )
      }
    >
      {({ close }) => <PinForm onDone={close} />}
    </Popover>
  )
}
