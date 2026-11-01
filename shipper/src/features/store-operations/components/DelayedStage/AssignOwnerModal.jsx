import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import FormField from '@/components/molecules/FormField'
import SelectField from '@/components/molecules/SelectField'
import Modal from '@/components/organisms/Modal'
import { getErrorMessage } from '@/app/services'
import { pluralize } from '@/lib/format'
import { useAssignOwner } from '@/features/store-operations/hooks/useFulfilmentActions'
import { ownerSchema } from '@/features/store-operations/schemas/ownerSchema'
import { reportBulkResult } from '@/features/store-operations/utils/bulkResult'

const FORM_ID = 'assign-owner-form'

function AssignOwnerForm({ orderNumbers, owners, mutation, onClose }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(ownerSchema), defaultValues: { owner: '' } })

  const submit = handleSubmit(({ owner }) =>
    mutation.mutate(
      { orderNumbers, owner },
      {
        onSuccess: (result) => {
          reportBulkResult(result, { done: `assigned to ${owner}` })
          onClose()
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    ),
  )

  return (
    <form id={FORM_ID} noValidate onSubmit={submit}>
      <FormField label="Resolution owner" required error={errors.owner?.message}>
        {(field) => (
          <Controller
            name="owner"
            control={control}
            render={({ field: owner }) => (
              <SelectField {...field} options={owners.map((name) => ({ value: name, label: name }))} placeholder="Choose a team member" value={owner.value} onChange={owner.onChange} />
            )}
          />
        )}
      </FormField>
    </form>
  )
}

/** Assigns one resolution owner to every checked exception. */
export default function AssignOwnerModal({ open, onClose, orderNumbers, owners }) {
  const mutation = useAssignOwner()

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Assign owner"
      description={`The owner takes over ${pluralize(orderNumbers.length, 'delayed order')}.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Assign owner
          </Button>
        </>
      }
    >
      <AssignOwnerForm orderNumbers={orderNumbers} owners={owners} mutation={mutation} onClose={onClose} />
    </Modal>
  )
}
