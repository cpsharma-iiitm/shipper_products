import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import { STOREFRONT } from '@/app/config/storefront'
import { paths } from '@/app/router/paths'
import Button from '@/components/atoms/Button'
import Checkbox from '@/components/atoms/Checkbox'
import Input from '@/components/atoms/Input'
import Alert from '@/components/molecules/Alert'
import FormField from '@/components/molecules/FormField'
import PasswordInput from '@/components/molecules/PasswordInput'
import AuthCard from '@/features/auth/components/AuthCard'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { loginSchema } from '@/features/auth/schemas/authSchemas'
import styles from './LoginForm.module.scss'

/** Log in with mobile number or email and a password. */
export default function LoginForm() {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    setFocus,
    resetField,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { identifier: '', password: '', rememberMe: false } })

  const submit = handleSubmit((values) =>
    login.mutate(values, {
      // Keep the identifier, clear the password and put the cursor where the person will retype it.
      onError: () => {
        resetField('password')
        setFocus('password')
      },
    }),
  )

  // ASSUMPTION — confirm with backend team: password reset and one-time-password login are not part of this
  // build, so the two buttons only explain that instead of pretending to start a flow.
  const notAvailable = (what) => toast.info(`${what} isn’t available yet. Please log in with your password, or write to ${STOREFRONT.supportEmail}.`)

  return (
    <AuthCard title="Welcome back" description="Log in to your Shipper.com account." chip="Login">
      <form className={styles.form} onSubmit={submit} noValidate>
        {login.isError && <Alert tone="danger">{getErrorMessage(login.error)}</Alert>}

        <FormField label="Mobile number or email" error={errors.identifier?.message}>
          {(control) => <Input {...control} {...register('identifier')} autoComplete="username" autoCapitalize="none" spellCheck={false} />}
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          {(control) => <PasswordInput {...control} {...register('password')} />}
        </FormField>

        <div className={styles.options}>
          <Checkbox label="Keep me signed in" {...register('rememberMe')} />
          <Button variant="link" size="sm" onClick={() => notAvailable('Password reset')}>
            Forgot password?
          </Button>
        </div>

        <Button type="submit" size="lg" rightIcon="arrow-right" loading={login.isPending} className={styles.submit}>
          Log in securely
        </Button>
      </form>

      <div className={styles.otp}>
        <p className={styles.otpText}>Prefer a one-time password? We’ll send a secure code to your registered mobile number.</p>
        <Button variant="secondary" size="lg" onClick={() => notAvailable('Login with OTP')}>
          Log in with OTP
        </Button>
      </div>

      <p className={styles.legal}>
        By continuing, you agree to our <Link to={paths.policy('terms')}>Terms of Service</Link> and{' '}
        <Link to={paths.policy('privacy')}>Privacy Policy</Link>.
      </p>
    </AuthCard>
  )
}
