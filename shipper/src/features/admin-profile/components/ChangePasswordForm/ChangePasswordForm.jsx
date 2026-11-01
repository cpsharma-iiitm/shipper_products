
import { zodResolver } from '@hookform/resolvers/zod'

import { useForm } from 'react-hook-form'

import { toast } from 'react-toastify'

import { getErrorMessage } from '@/app/services'

import Button from '@/components/atoms/Button'

import Card from '@/components/atoms/Card'

import FormField from '@/components/molecules/FormField'

import PasswordInput from '@/components/molecules/PasswordInput'

import { useChangePassword } from '@/features/admin-profile/hooks/useAdminProfile'

import { emptyPasswordValues, passwordChangeSchema } from '@/features/admin-profile/schemas/profileSchema'

import { applyServerErrors } from '@/features/products/utils/applyServerErrors'

import styles from './ChangePasswordForm.module.scss'

/** Change password: current password, then the new one twice. The backend checks the current password. */

export default function ChangePasswordForm() {

    const change = useChangePassword()

    const {

        register,

        handleSubmit,

        reset,

        setError,

        formState: { errors },

    } = useForm({ resolver: zodResolver(passwordChangeSchema), defaultValues: emptyPasswordValues, mode: 'onTouched' })

    const onSubmit = ({ currentPassword, newPassword }) => {

        change.mutate(

            { currentPassword, newPassword },

            {

                onSuccess: () => {

                    reset(emptyPasswordValues)

                    toast.success('Password changed.')

                },

                onError: (error) => {

                    if (!applyServerErrors(error, setError)) toast.error(getErrorMessage(error))

                },

            },

        )

    }

    return (
        <Card title="Change password" padding="md" radius="md">
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                    <div className="col-12 col-md-6">
                        <FormField label="Current password" required error={errors.currentPassword?.message}>

                            {(field) => <PasswordInput {...field} {...register('currentPassword')} size="md" />}
                        </FormField>
                    </div>
                    <div className="col-12 col-md-6 d-none d-md-block" aria-hidden="true" />
                    <div className="col-12 col-md-6">
                        <FormField

                            label="New password"

                            required

                            hint="Use 8+ characters, including a number and a special character."

                            error={errors.newPassword?.message}
                        >

                            {(field) => <PasswordInput {...field} {...register('newPassword')} size="md" autoComplete="new-password" />}
                        </FormField>
                    </div>
                    <div className="col-12 col-md-6">
                        <FormField label="Confirm new password" required error={errors.confirmPassword?.message}>

                            {(field) => <PasswordInput {...field} {...register('confirmPassword')} size="md" autoComplete="new-password" />}
                        </FormField>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Button type="submit" size="md" loading={change.isPending}>

                        Update password
                    </Button>
                </div>
            </form>
        </Card>

    )

}
