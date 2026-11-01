import AddressSummary from '@/components/molecules/AddressSummary'
import AddressHeading from '@/features/profile/components/AddressHeading'
import styles from './AddressListItem.module.scss'

/** One saved address with its actions: edit, set as default (when it isn't) and remove. */
export default function AddressListItem({ address, onEdit, onSetDefault, onRemove, busy = false }) {
  return (
    <article className={styles.item} aria-label={`${address.label} address`}>
      <AddressHeading address={address} />
      <AddressSummary address={address} />
      <div className={styles.actions}>
        <button type="button" className={styles.edit} onClick={() => onEdit(address)}>
          Edit address<span className="visually-hidden">: {address.label}</span>
        </button>
        {!address.isDefault && (
          <button type="button" className={styles.action} disabled={busy} onClick={() => onSetDefault(address)}>
            Set as default<span className="visually-hidden">: {address.label}</span>
          </button>
        )}
        <button type="button" className={styles.action} onClick={() => onRemove(address)}>
          Remove<span className="visually-hidden">: {address.label}</span>
        </button>
      </div>
    </article>
  )
}
