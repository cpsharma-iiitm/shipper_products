import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '@/app/services'
import { paths } from '@/app/router/paths'
import Button from '@/components/atoms/Button'
import Checkbox from '@/components/atoms/Checkbox'
import Input from '@/components/atoms/Input'
import Alert from '@/components/molecules/Alert'
import FormField from '@/components/molecules/FormField'
import PasswordInput from '@/components/molecules/PasswordInput'
import AuthCard from '@/features/auth/components/AuthCard'
import { useMobileAvailability } from '@/features/auth/hooks/useMobileAvailability'
import { useSignup } from '@/features/auth/hooks/useSignup'
import { signupSchema } from '@/features/auth/schemas/authSchemas'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { mobileSchema } from '@/lib/validation'
import styles from './SignupForm.module.scss'

const PASSWORD_RULE = 'Use 8+ characters, including a number and a special character.'
const MOBILE_TAKEN = 'An account with this mobile number already exists. Try logging in instead.'

/** Create an account. The mobile number is checked against existing accounts while the person types. */
export default function SignupForm() {
  const signup = useSignup()
  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', mobile: '', email: '', password: '', acceptTerms: false, marketingOptIn: false },
  })

  // React Hook Form focuses the first invalid field in the order fields were registered. The fields below
  // register while their own FormField renders, after this component's checkboxes, so register everything
  // here in page order instead.
  const fields = {
    name: register('name'),
    mobile: register('mobile'),
    email: register('email'),
    password: register('password'),
    acceptTerms: register('acceptTerms'),
    marketingOptIn: register('marketingOptIn'),
  }

  // Ask the backend only once the number is complete and valid, and only after typing pauses.
  const typedMobile = useDebouncedValue(useWatch({ control, name: 'mobile' }), 400)
  const parsedMobile = mobileSchema.safeParse(typedMobile)
  const mobile = parsedMobile.success ? parsedMobile.data : ''
  const availability = useMobileAvailability(mobile)
  const taken = availability.data?.available === false

  let mobileHint
  let mobileSuccess
  if (mobile && availability.isFetching) mobileHint = 'Checking availability…'
  else if (mobile && availability.data?.available) mobileSuccess = 'Mobile number is available for registration'

  const reportMobileTaken = () => {
    setError('mobile', { type: 'server', message: MOBILE_TAKEN })
    setFocus('mobile')
  }

  const submit = handleSubmit((values) => {
    if (taken) return reportMobileTaken()
    signup.mutate(
      {
        name: values.name,
        mobile: values.mobile,
        email: values.email,
        password: values.password,
        acceptedTerms: values.acceptTerms,
        marketingOptIn: values.marketingOptIn,
      },
      { onError: (error) => error.status === 409 && reportMobileTaken() },
    )
  })

  const mobileError = errors.mobile?.message ?? (taken ? MOBILE_TAKEN : undefined)

  return (
    <AuthCard title="Your everyday starts here" description="Create an account. A little goodness awaits." chip="Sign up">
      <form className={styles.form} onSubmit={submit} noValidate>
        {signup.isError && signup.error.status !== 409 && <Alert tone="danger">{getErrorMessage(signup.error)}</Alert>}

        <FormField label="Full name" error={errors.name?.message}>
          {(field) => <Input {...field} {...fields.name} autoComplete="name" />}
        </FormField>

        <div className={styles.pair}>
          <FormField label="Mobile number" error={mobileError} hint={mobileHint} success={mobileSuccess}>
            {(field) => <Input {...field} {...fields.mobile} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" />}
          </FormField>

          <FormField label="Email address" error={errors.email?.message}>
            {(field) => <Input {...field} {...fields.email} type="email" autoComplete="email" />}
          </FormField>
        </div>

        <FormField label="Create password" error={errors.password?.message} hint={PASSWORD_RULE}>
          {(field) => <PasswordInput {...field} {...fields.password} autoComplete="new-password" />}
        </FormField>

        <div className={styles.consents}>
          <div className={styles.consent}>
            <Checkbox
              invalid={Boolean(errors.acceptTerms)}
              label={
                <>
                  I agree to the <Link to={paths.policy('terms')} target="_blank" rel="noopener">Terms of Service</Link> and{' '}
                  <Link to={paths.policy('privacy')} target="_blank" rel="noopener">Privacy Policy</Link>.
                </>
              }
              {...fields.acceptTerms}
            />
            {errors.acceptTerms && <p role="alert" className={styles.error}>{errors.acceptTerms.message}</p>}
          </div>

          <Checkbox label="Send me thoughtful offers and product updates. (Optional)" {...fields.marketingOptIn} />
        </div>

        <Button type="submit" size="lg" rightIcon="arrow-right" loading={signup.isPending} className={styles.submit}>
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
