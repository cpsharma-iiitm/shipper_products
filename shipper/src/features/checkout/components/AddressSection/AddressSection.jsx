import { useId } from 'react'
import clsx from 'clsx'
import { useFormContext } from 'react-hook-form'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Input from '@/components/atoms/Input'
import Radio from '@/components/atoms/Radio'
import Skeleton from '@/components/atoms/Skeleton'
import StatusBadge from '@/components/atoms/StatusBadge'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import FormField from '@/components/molecules/FormField'
import { ALTERNATE_MOBILE_COMPACT_ERROR, CHECKOUT_COPY } from '@/features/checkout/lib/checkoutCopy'
import { formatAddress, formatMobile } from '@/lib/address'
import styles from './AddressSection.module.scss'

function AddressOption({ address, selected, compact, onSelect, onEdit }) {
  const id = useId()
  return (
    <div className={clsx(styles.option, selected && styles.selected)}>
      <Radio id={id} name="deliveryAddress" checked={selected} onChange={() => onSelect(address.id)} />
      <label htmlFor={id} className={styles.body}>
        <span className={styles.heading}>
          {address.label}
          {address.isDefault && ' · Default'}
          {selected && <StatusBadge status={address.verified ? 'verified' : 'unverified'} className={styles.badge} />}
        </span>
        {selected && (
          <span className={styles.contact}>
            {address.name} · {formatMobile(address.mobile)}
          </span>
        )}
        <span className={styles.address}>{formatAddress(address)}</span>
      </label>
      {selected && !compact && (
        <Button variant="link" size="sm" className={styles.edit} onClick={() => onEdit(address)}>
          Edit<span className="visually-hidden"> {address.label} address</span>
        </Button>
      )}
    </div>
  )
}

/**
 * Saved addresses to deliver to (the customer picks one; the quote is re-priced for it), plus the delivery
 * notes and an alternate mobile number. Adding and editing go through the shared address drawer.
 */
export default function AddressSection({ compact, addresses, selectedId, onSelect, onAdd, onEdit }) {
  const copy = CHECKOUT_COPY[compact ? 'compact' : 'wide']
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const selected = addresses.data?.find((address) => address.id === selectedId)
  const alternateMobileError = errors.alternateMobile && (compact ? ALTERNATE_MOBILE_COMPACT_ERROR : errors.alternateMobile.message)

  let list
  if (addresses.isPending) {
    list = (
      <div className={styles.loading} role="status" aria-label="Loading your addresses">
        <Skeleton width="40%" height="1.125rem" />
        <Skeleton width="85%" />
      </div>
    )
  } else if (addresses.isError) {
    list = <ErrorState compact title="We couldn’t load your addresses" message={getErrorMessage(addresses.error)} onRetry={addresses.refetch} />
  } else if (addresses.data.length === 0) {
    list = (
      <EmptyState
        compact
        icon="geo-alt"
        title="Add a delivery address"
        description="We need an address to show delivery dates and place your order."
        action={
          <Button variant="secondary" size="sm" leftIcon="plus-lg" onClick={onAdd}>
            Add new address
          </Button>
        }
      />
    )
  } else {
    list = (
      <>
        <fieldset className={styles.group}>
          <legend className="visually-hidden">Choose a delivery address</legend>
          {addresses.data.map((address) => (
            <AddressOption
              key={address.id}
              address={address}
              selected={address.id === selectedId}
              compact={compact}
              onSelect={onSelect}
              onEdit={onEdit}
            />
          ))}
        </fieldset>
        <div className={styles.actions}>
          {compact && (
            <Button variant="secondary" size="sm" disabled={!selected} onClick={() => onEdit(selected)}>
              Edit address
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onAdd}>
            {compact ? '+ Add new' : '+ Add new address'}
          </Button>
        </div>
      </>
    )
  }

  return (
    <Card title={copy.addressTitle} padding={compact ? 'sm' : 'md'}>
      {list}
      <div className={styles.fields}>
        <FormField label="Delivery instructions (optional)" error={errors.deliveryInstructions?.message}>
          {(control) => <Input {...control} {...register('deliveryInstructions')} placeholder="For example: call on arrival" />}
        </FormField>
        <FormField label={copy.alternateMobileLabel} error={alternateMobileError}>
          {(control) => <Input {...control} {...register('alternateMobile')} type="tel" inputMode="tel" autoComplete="off" />}
        </FormField>
      </div>
    </Card>
  )
}
