import { useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { z } from 'zod'
import { getErrorMessage } from '@/app/services'
import { deliveryLocationSet, selectDeliveryLocation } from '@/app/store'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import { useServiceabilityCheck } from '@/features/storefront/hooks/useServiceabilityCheck'
import { formatShortDate } from '@/lib/date'
import { pinCodeSchema } from '@/lib/validation'
import styles from './DeliveryCheck.module.scss'

const schema = z.object({ pin: pinCodeSchema })

function resultMessage(check) {
  if (check.isError) return { error: getErrorMessage(check.error) }
  if (!check.data) return {}
  if (!check.data.serviceable) return { error: 'We don’t deliver to this PIN code yet.' }
  const { etaFrom, etaTo } = check.data
  return { success: `Delivery available · Arrives ${formatShortDate(etaFrom)} – ${formatShortDate(etaTo)}` }
}

/**
 * Inline "Delivery PIN code" check for product pages. It starts from the customer's chosen delivery
 * location (checked straight away, so the estimate is already there) and a serviceable PIN becomes the
 * new delivery location shown in the header.
 */
export default function DeliveryCheck({ className }) {
  const dispatch = useDispatch()
  const location = useSelector(selectDeliveryLocation)
  const check = useServiceabilityCheck()
  const hasAutoChecked = useRef(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { pin: location?.pin ?? '' } })

  useEffect(() => {
    if (hasAutoChecked.current || !location?.pin) return
    hasAutoChecked.current = true
    check.mutate(location.pin)
  }, [check, location?.pin])

  const submit = ({ pin }) =>
    check.mutate(pin, {
      onSuccess: (result) => {
        if (result.serviceable) dispatch(deliveryLocationSet({ pin: result.pin, city: result.city }))
      },
    })

  const { error, success } = resultMessage(check)

  return (
    <form className={className} onSubmit={handleSubmit(submit)} noValidate>
      <FormField label="Delivery PIN code" error={errors.pin?.message ?? error} success={success}>
        {(control) => (
          <div className={styles.row}>
            <Input {...control} inputMode="numeric" maxLength={6} autoComplete="postal-code" {...register('pin')} />
            <Button type="submit" variant="secondary" size="lg" loading={check.isPending}>
              Check
            </Button>
          </div>
        )}
      </FormField>
    </form>
  )
}
