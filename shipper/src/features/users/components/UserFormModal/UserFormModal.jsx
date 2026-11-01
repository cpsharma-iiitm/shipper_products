import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import FormField from '@/components/molecules/FormField'
import Modal from '@/components/organisms/Modal'
import { USER_FORM_STATUS_OPTIONS } from '@/features/users/constants/userOptions'
import { useCreateUser, useUpdateUser } from '@/features/users/hooks/useUsers'
import { userSchema } from '@/features/users/schemas/userSchema'

const FORM_ID = 'user-form'

const toFormValues = (user) => ({
  name: user?.name ?? '',
  email: user?.email ?? '',
  mobile: user?.mobile ?? '',
  roleId: user?.roleId ?? '',
  status: user?.status ?? 'active',
})

function UserForm({ user, roles, isSelf, mutation, onClose }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(userSchema), defaultValues: toFormValues(user) })

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(user ? { id: user.id, ...values } : values, {
      onSuccess: (saved) => {
        toast.success(user ? `${saved.name} was updated.` : `${saved.name} was added as ${saved.roleName}.`)
        onClose()
      },
      onError: (error) => {
        // Field-level problems from the backend (for example a duplicate email) are shown on the field itself.
        const fieldErrors = Object.entries(error.details ?? {})
        if (fieldErrors.length === 0) return toast.error(error.message)
        fieldErrors.forEach(([field, message], index) => setError(field, { type: 'server', message }, { shouldFocus: index === 0 }))
      },
    }),
  )

  return (
    <form id={FORM_ID} className="row g-3" onSubmit={onSubmit} noValidate>
      <div className="col-12 col-md-6">
        <FormField label="Full name" required error={errors.name?.message}>
          {(control) => <Input {...control} {...register('name')} autoComplete="off" placeholder="For example, Neha Joshi" />}
        </FormField>
      </div>
      <div className="col-12 col-md-6">
        <FormField label="Email" required error={errors.email?.message}>
          {(control) => <Input {...control} {...register('email')} type="email" autoComplete="off" placeholder="name@shipper.com" />}
        </FormField>
      </div>
      <div className="col-12 col-md-6">
        <FormField label="Mobile" hint="Optional. 10-digit Indian mobile number." error={errors.mobile?.message}>
          {(control) => <Input {...control} {...register('mobile')} type="tel" inputMode="numeric" autoComplete="off" placeholder="98765 43210" />}
        </FormField>
      </div>
      <div className="col-12 col-md-6">
        <FormField label="Role" required error={errors.roleId?.message}>
          {(control) => (
            <Select {...control} {...register('roleId')}>
              <option value="">Choose a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </div>
      <div className="col-12 col-md-6">
        <FormField label="Status" required hint={isSelf ? "You can't deactivate your own account." : undefined} error={errors.status?.message}>
          {(control) => (
            <Select {...control} {...register('status')}>
              {USER_FORM_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} disabled={isSelf && option.value === 'inactive'}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </div>
    </form>
  )
}

/** Add user (no `user`) or edit user. Validation here is for convenience; the backend decides what is accepted. */
export default function UserFormModal({ open, user, roles, currentUserId, onClose }) {
  const create = useCreateUser()
  const update = useUpdateUser()
  const mutation = user ? update : create

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={user ? `Edit ${user.name}` : 'Add user'}
      description={user ? 'Change their details, role or status.' : 'They will be able to sign in to the admin dashboard with this role.'}
      closeOnBackdrop={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
      footer={
        <>
          <Button variant="secondary" disabled={mutation.isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            {user ? 'Save changes' : 'Add user'}
          </Button>
        </>
      }
    >
      <UserForm key={user?.id ?? 'new'} user={user} roles={roles} isSelf={Boolean(user) && user.id === currentUserId} mutation={mutation} onClose={onClose} />
    </Modal>
  )
}
