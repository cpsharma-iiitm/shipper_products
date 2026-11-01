import { zodResolver } from '@hookform/resolvers/zod'

import { useForm } from 'react-hook-form'

import { toast } from 'react-toastify'

import { getErrorMessage } from '@/app/services'

import Button from '@/components/atoms/Button'

import Card from '@/components/atoms/Card'

import Input from '@/components/atoms/Input'

import FormField from '@/components/molecules/FormField'

import { useUpdateProfile } from '@/features/admin-profile/hooks/useAdminProfile'

import { profileSchema, toProfileFormValues } from '@/features/admin-profile/schemas/profileSchema'

import { applyServerErrors } from '@/features/products/utils/applyServerErrors'

import styles from './ProfileDetailsForm.module.scss'

/** Edit name, email and mobile. The role is shown read-only: it is changed from User roles, not here. */

export default function ProfileDetailsForm({ profile }) {

    const save = useUpdateProfile()

    const {

        register,

        handleSubmit,

        reset,

        setError,

        formState: { errors, isDirty },

    } = useForm({ resolver: zodResolver(profileSchema), defaultValues: toProfileFormValues(profile), mode: 'onTouched' })

    const onSubmit = (values) => {

        save.mutate(values, {

            onSuccess: (saved) => {

                reset(toProfileFormValues(saved))

                toast.success('Profile updated.')

            },

            onError: (error) => {

                if (!applyServerErrors(error, setError)) toast.error(getErrorMessage(error))

            },

        })

    }

    return (
        <Card title="Personal details" padding="md" radius="md">
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                    <div className="col-12 col-md-6">
                        <FormField label="Full name" required error={errors.name?.message}>

                            {(field) => <Input {...field} {...register('name')} size="md" autoComplete="name" />}
                        </FormField>
                    </div>
                    <div className="col-12 col-md-6">
                        <FormField label="Role" hint="Roles are managed under User roles.">

                            {(field) => <Input {...field} size="md" readOnly value={profile.roleLabel} />}
                        </FormField>
                    </div>
                    <div className="col-12 col-md-6">
                        <FormField label="Email address" required error={errors.email?.message}>

                            {(field) => <Input {...field} {...register('email')} size="md" type="email" autoComplete="email" />}
                        </FormField>
                    </div>
                    <div className="col-12 col-md-6">
                        <FormField label="Mobile number" required error={errors.mobile?.message}>

                            {(field) => <Input {...field} {...register('mobile')} size="md" type="tel" inputMode="numeric" autoComplete="tel-national" />}
                        </FormField>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Button type="submit" size="md" loading={save.isPending} disabled={!isDirty}>

                        Save changes
                    </Button>
                    <Button variant="secondary" size="md" disabled={!isDirty || save.isPending} onClick={() => reset(toProfileFormValues(profile))}>

                        Discard
                    </Button>
                </div>
            </form>
        </Card>

    )

}
