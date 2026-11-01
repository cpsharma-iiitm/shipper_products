import { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import { selectCurrentUser } from '@/app/store'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Skeleton from '@/components/atoms/Skeleton'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import ConfirmDialog from '@/components/organisms/ConfirmDialog'
import { AddressDrawer, useAddresses, useDeleteAddress, useSetDefaultAddress } from '@/features/addresses'
import AddressListItem from '@/features/profile/components/AddressListItem'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatAddress } from '@/lib/address'
import styles from './SavedAddressesCard.module.scss'

/** "Saved addresses": the customer's addresses with add, edit, set-as-default and remove. */
export default function SavedAddressesCard() {
  const user = useSelector(selectCurrentUser)
  const addresses = useAddresses()
  const removeAddress = useDeleteAddress()
  const setDefaultAddress = useSetDefaultAddress()
  const drawer = useDisclosure()
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)

  const openDrawer = (address = null) => {
    setEditing(address)
    drawer.open()
  }

  const makeDefault = (address) =>
    setDefaultAddress.mutate(address.id, {
      onSuccess: () => toast.success(`${address.label} is now your default address.`),
      onError: (error) => toast.error(getErrorMessage(error, 'We could not change your default address. Please try again.')),
    })

  const confirmRemove = () =>
    removeAddress.mutate(removing.id, {
      onSuccess: () => {
        toast.success('Address removed.')
        setRemoving(null)
      },
      onError: (error) => toast.error(getErrorMessage(error, 'We could not remove this address. Please try again.')),
    })

  const addButton = (
    <Button variant="secondary" size="sm" leftIcon="plus-lg" onClick={() => openDrawer()}>
      Add new address
    </Button>
  )

  let content
  if (addresses.isPending) {
    content = (
      <div className={styles.skeleton} aria-busy="true" aria-label="Loading your addresses">
        <Skeleton width="9rem" height="1.25rem" />
        <Skeleton width="60%" height="1rem" />
        <Skeleton width="85%" height="1rem" />
      </div>
    )
  } else if (addresses.isError) {
    content = <ErrorState compact title="We couldn’t load your addresses" message={getErrorMessage(addresses.error)} onRetry={addresses.refetch} />
  } else if (addresses.data.length === 0) {
    content = <EmptyState compact icon="geo-alt" title="No saved addresses yet" description="Add one to check out faster." action={addButton} />
  } else {
    content = (
      <>
        <div className={styles.list}>
          {addresses.data.map((address) => (
            <AddressListItem
              key={address.id}
              address={address}
              busy={setDefaultAddress.isPending}
              onEdit={openDrawer}
              onSetDefault={makeDefault}
              onRemove={setRemoving}
            />
          ))}
        </div>
        {addButton}
      </>
    )
  }

  return (
    <Card title="Saved addresses" padding="md">
      {content}

      <AddressDrawer open={drawer.isOpen} onClose={drawer.close} address={editing} defaults={{ name: user?.name ?? '', mobile: user?.mobile ?? '' }} />

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
        tone="danger"
        title="Remove this address?"
        message={removing && `${removing.label} · ${formatAddress(removing)} will be removed from your saved addresses.`}
        confirmLabel="Remove address"
        loading={removeAddress.isPending}
      />
    </Card>
  )
}
