import { useState } from 'react'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Radio from '@/components/atoms/Radio'
import AddressSummary from '@/components/molecules/AddressSummary'
import Modal from '@/components/organisms/Modal'
import styles from './AddressPickerModal.module.scss'

/** Lists the customer's saved addresses and returns the one chosen. Mount it only while open. */
export default function AddressPickerModal({ addresses, selectedId, onSelect, onClose }) {
  const [choice, setChoice] = useState(selectedId)

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title="Change delivery address"
      description="Choose one of the customer’s saved addresses."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!choice}
            onClick={() => {
              onSelect(choice)
              onClose()
            }}
          >
            Use this address
          </Button>
        </>
      }
    >
      <fieldset className={styles.list}>
        <legend className="visually-hidden">Saved addresses</legend>
        {addresses.map((address) => (
          <div key={address.id} className={styles.option}>
            <Radio
              name="delivery-address"
              checked={choice === address.id}
              onChange={() => setChoice(address.id)}
              label={
                <span className={styles.heading}>
                  {address.label}
                  {address.isDefault && ' · Default'}
                  {address.verified && <Badge tone="success">Verified</Badge>}
                </span>
              }
            />
            <AddressSummary address={address} className={styles.summary} />
          </div>
        ))}
      </fieldset>
    </Modal>
  )
}
