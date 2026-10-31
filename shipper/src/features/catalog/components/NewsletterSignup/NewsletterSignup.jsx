import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import FormField from '@/components/molecules/FormField'
import { useNewsletterSignup } from '@/features/catalog/hooks/useCatalog'
import { newsletterSchema } from '@/features/catalog/schemas/newsletterSchema'
import styles from './NewsletterSignup.module.scss'

/** "Good things in your inbox": email sign-up. */
export default function NewsletterSignup() {
  const signup = useNewsletterSignup()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(newsletterSchema), defaultValues: { email: '' } })

  const submit = ({ email }) =>
    signup.mutate(email, {
      onSuccess: () => {
        toast.success('Thank you! You’re on the list for fresh finds and offers.')
        reset()
      },
      onError: (error) => setError('email', { message: getErrorMessage(error) }),
    })

  return (
    <section className={styles.section} aria-labelledby="newsletter-title">
      <div className={styles.band}>
        <div className={styles.text}>
          <h2 id="newsletter-title" className={styles.title}>
            Good things in your inbox.
          </h2>
          <p className={styles.description}>Fresh finds, thoughtful offers, and a little everyday inspiration.</p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
          <FormField label="Your email" error={errors.email?.message} className={styles.field}>
            {(control) => (
              <Input {...control} type="email" autoComplete="email" placeholder="Enter your email address" {...register('email')} />
            )}
          </FormField>
          <Button type="submit" size="lg" rightIcon="arrow-right" loading={signup.isPending} className={styles.submit}>
            Count me in
          </Button>
        </form>
      </div>
    </section>
  )
}
