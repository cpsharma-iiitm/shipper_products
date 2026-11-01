import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import FormField from '@/components/molecules/FormField'
import PasswordInput from '@/components/molecules/PasswordInput'
import Modal from '@/components/organisms/Modal'
import { useChangePassword } from '@/features/profile/hooks/useProfile'
import { changePasswordSchema } from '@/features/profile/schemas/profileSchema'
import { applyFieldErrors } from '@/features/profile/utils/serverErrors'
import styles from './ChangePasswordModal.module.scss'

const FORM_ID = 'change-password-form'
const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' }

/** Change password: the current password and a new one entered twice. The backend checks the current password. */
export default function ChangePasswordModal({ open, onClose }) {
  const change = useChangePassword()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: EMPTY })

  // Closing clears what was typed, so a password never lingers in a dialog that is out of sight.
  const close = () => {
    reset(EMPTY)
    change.reset()
    onClose()
  }

  const onSubmit = handleSubmit(({ currentPassword, newPassword }) => {
    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success('Your password has been changed.')
          close()
        },
        onError: (error) => {
          if (!applyFieldErrors(error, setError, ['currentPassword', 'newPassword'])) {
            toast.error(getErrorMessage(error, 'We could not change your password. Please try again.'))
          }
        },
      },
    )
  })

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title="Change password"
      description="Choose a new password you don’t use anywhere else."
      closeOnBackdrop={!change.isPending}
      closeOnEscape={!change.isPending}
      footer={
        <>
          <Button variant="secondary" disabled={change.isPending} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={change.isPending}>
            Update password
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={styles.form} onSubmit={onSubmit} noValidate>
        <FormField label="Current password" error={errors.currentPassword?.message}>
          {(field) => <PasswordInput {...field} {...register('currentPassword')} autoComplete="current-password" />}
        </FormField>
        <FormField label="New password" error={errors.newPassword?.message} hint="Use 8+ characters, including a number and a special character.">
          {(field) => <PasswordInput {...field} {...register('newPassword')} autoComplete="new-password" />}
        </FormField>
        <FormField label="Confirm new password" error={errors.confirmPassword?.message}>
          {(field) => <PasswordInput {...field} {...register('confirmPassword')} autoComplete="new-password" />}
        </FormField>
      </form>
    </Modal>
  )
}
