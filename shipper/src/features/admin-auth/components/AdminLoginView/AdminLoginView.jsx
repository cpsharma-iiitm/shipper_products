import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { paths } from '@/app/router/paths'
import { selectCurrentUser } from '@/app/store'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Input from '@/components/atoms/Input'
import Logo from '@/components/atoms/Logo'
import Alert from '@/components/molecules/Alert'
import FormField from '@/components/molecules/FormField'
import PasswordInput from '@/components/molecules/PasswordInput'
import { useAdminLogin } from '@/features/admin-auth/hooks/useAdminLogin'
import { adminLoginDefaults, adminLoginSchema } from '@/features/admin-auth/schemas/adminLoginSchema'
import styles from './AdminLoginView.module.scss'

/** Where to go after signing in: the admin route the guard remembered, otherwise the dashboard. */
function getDestination(location) {
    const from = location.state?.from
    return from?.pathname?.startsWith(paths.admin.root) && from.pathname !== paths.admin.login
        ? `${from.pathname}${from.search ?? ''}`
        : paths.admin.dashboard
}

/**
 * Standalone admin sign-in (no admin layout): logo card, email or mobile plus password, an error
 * banner for refused sign-ins, and a way back to the storefront. A signed-in admin is sent straight on.
 */
export default function AdminLoginView() {
    const formId = useId()
    const navigate = useNavigate()
    const location = useLocation()
    const user = useSelector(selectCurrentUser)
    const login = useAdminLogin()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(adminLoginSchema), defaultValues: adminLoginDefaults, mode: 'onTouched' })

    if (user?.role === 'admin' && !login.isPending) return <Navigate to={getDestination(location)} replace />

    const onSubmit = (values) => {
        login.mutate(values, { onSuccess: () => navigate(getDestination(location), { replace: true }) })
    }

    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <Logo size="lg" className={styles.logo} />
                <h1 className={styles.title}>Admin sign in</h1>
                <p className={styles.description}>Sign in to manage products, orders and store operations.</p>

                <form id={formId} noValidate className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    {login.isError && (
                        <Alert tone="danger" title={login.error.status === 403 ? 'No admin access' : 'Could not sign in'}>
                            {login.error.message}
                        </Alert>
                    )}
                    <FormField label="Email or mobile number" required error={errors.identifier?.message}>
                        {(field) => (
                            <Input
                                {...field}
                                {...register('identifier')}
                                leftIcon="person"
                                autoComplete="username"
                                autoFocus
                                placeholder="you@shipper.com or 10-digit mobile"
                            />
                        )}
                    </FormField>
                    <FormField label="Password" required error={errors.password?.message}>
                        {(field) => <PasswordInput {...field} {...register('password')} placeholder="Enter your password" />}
                    </FormField>
                    <Button type="submit" size="lg" fullWidth loading={login.isPending}>
                        Sign in
                    </Button>
                </form>
            </div>

            <Link to={paths.home} className={styles.back}>
                <Icon name="arrow-left" /> Back to storefront
            </Link>
        </main>
    )
}