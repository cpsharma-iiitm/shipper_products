import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Input from '@/components/atoms/Input'
import Skeleton from '@/components/atoms/Skeleton'
import ErrorState from '@/components/molecules/ErrorState'
import FormField from '@/components/molecules/FormField'
import ChangePasswordModal from '@/features/profile/components/ChangePasswordModal'
import { useProfile, useUpdateProfile } from '@/features/profile/hooks/useProfile'
import { profileSchema } from '@/features/profile/schemas/profileSchema'
import { applyFieldErrors } from '@/features/profile/utils/serverErrors'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatMobile } from '@/lib/address'
import styles from './PersonalDetailsCard.module.scss'

const FIELDS = ['name', 'mobile', 'email']

const toFormValues = (profile) => ({ name: profile.name, mobile: formatMobile(profile.mobile), email: profile.email })

function PersonalDetailsForm({ profile, onChangePassword }) {
  const update = useUpdateProfile()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(profileSchema), defaultValues: toFormValues(profile) })

  const onSubmit = handleSubmit((values) => {
    update.mutate(values, {
      onSuccess: (saved) => {
        reset(toFormValues(saved))
        toast.success('Your details have been saved.')
      },
      onError: (error) => {
        if (!applyFieldErrors(error, setError, FIELDS)) toast.error(getErrorMessage(error, 'We could not save your details. Please try again.'))
      },
    })
  })

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <FormField label="Full name" error={errors.name?.message}>
          {(field) => <Input {...field} {...register('name')} autoComplete="name" />}
        </FormField>
        <FormField label="Mobile" error={errors.mobile?.message}>
          {(field) => <Input {...field} {...register('mobile')} type="tel" inputMode="tel" autoComplete="tel" />}
        </FormField>
      </div>
      <FormField label="Email" error={errors.email?.message}>
        {(field) => <Input {...field} {...register('email')} type="email" autoComplete="email" />}
      </FormField>
      <div className={styles.actions}>
        <Button type="submit" size="sm" loading={update.isPending}>
          Save changes
        </Button>
        <Button variant="secondary" size="sm" onClick={onChangePassword}>
          Change password
        </Button>
      </div>
    </form>
  )
}

/** "Personal details": name, mobile and email of the signed-in customer, and the entry to Change password. */
export default function PersonalDetailsCard() {
  const profile = useProfile()
  const passwordModal = useDisclosure()

  return (
    <Card title="Personal details" padding="md">
      {profile.isPending && (
        <div className={styles.form} aria-busy="true" aria-label="Loading your details">
          <Skeleton height="2.75rem" />
          <Skeleton height="2.75rem" />
          <Skeleton width="12rem" height="2.125rem" />
        </div>
      )}
      {profile.isError && <ErrorState compact title="We couldn’t load your details" message={getErrorMessage(profile.error)} onRetry={profile.refetch} />}
      {profile.data && <PersonalDetailsForm profile={profile.data} onChangePassword={passwordModal.open} />}
      <ChangePasswordModal open={passwordModal.isOpen} onClose={passwordModal.close} />
    </Card>
  )
}
