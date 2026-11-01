import { useFormContext, useWatch } from 'react-hook-form'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import AddressSummary from '@/components/molecules/AddressSummary'
import { useDisclosure } from '@/hooks/useDisclosure'
import AddressPickerModal from '@/features/purchases/components/AddressPickerModal'
import styles from './DeliveryAddressCard.module.scss'

const SUPPLY_LABELS = { intra_state: 'Intra-state supply', inter_state: 'Inter-state supply' }

/** The address the purchase ships to, with the PIN serviceability and GST supply type the backend reports for it. */
export default function DeliveryAddressCard({ delivery }) {
  const { control, setValue, formState } = useFormContext()
  const customer = useWatch({ control, name: 'customer' })
  const addressId = useWatch({ control, name: 'addressId' })
  const picker = useDisclosure()
  const address = customer?.addresses.find((entry) => entry.id === addressId)

  return (
    <Card title="Delivery address" radius="md" padding="sm">
      {address ? (
        <div className={styles.address}>
          <p className={styles.heading}>
            {address.label}
            {address.isDefault && ' · Default'}
            {address.verified && <Badge tone="success">Verified</Badge>}
          </p>
          <AddressSummary address={address} className={styles.summary} />
          <div className={styles.meta}>
            {delivery && (
              <Badge tone={delivery.serviceable ? 'success' : 'danger'}>
                {delivery.serviceable ? `PIN ${delivery.pin} serviceable` : `PIN ${delivery.pin} not serviceable`}
              </Badge>
            )}
            {customer.addresses.length > 1 && (
              <Button variant="link" size="sm" onClick={picker.open}>
                Change address
              </Button>
            )}
          </div>
          {delivery && (
            <p className={styles.gst}>
              GST state code: {delivery.gstStateCode} · {SUPPLY_LABELS[delivery.supply] ?? delivery.supply}
            </p>
          )}
        </div>
      ) : (
        <p className={styles.empty}>
          {customer ? 'This customer has no saved delivery address.' : 'Find a customer to see their saved delivery address.'}
        </p>
      )}
      {formState.errors.addressId && !address && customer && (
        <p role="alert" className={styles.error}>
          {formState.errors.addressId.message}
        </p>
      )}

      {picker.isOpen && (
        <AddressPickerModal
          addresses={customer.addresses}
          selectedId={addressId}
          onSelect={(id) => setValue('addressId', id, { shouldValidate: true })}
          onClose={picker.close}
        />
      )}
    </Card>
  )
}
