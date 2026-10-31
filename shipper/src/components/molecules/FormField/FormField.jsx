import { useId } from 'react'
import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './FormField.module.scss'
/**
* Label + control + hint/error/success wiring. `children` is a render function that receives the
* accessibility props to spread onto the control (Input, Select, Checkbox, SelectField):
* * <FormField label="Mobile number" required error={errors.mobile?.message}>
* {(control) => <Input {...control} {...register('mobile')} />}
* </FormField>
* * `control` = { id, invalid, 'aria-invalid', 'aria-describedby', 'aria-required' }.
*/
export default function FormField({ label, hint, error, success, required = false, htmlFor, className, children }) {
  const baseId = useId()
  const controlId = htmlFor ?? `${baseId}-control`
  const hintId = `${baseId}-hint`
  const messageId = `${baseId}-message`
  const showHint = Boolean(hint) && !error
  const showSuccess = Boolean(success) && !error
  const describedBy = [showHint && hintId, (error || showSuccess) && messageId].filter(Boolean).join(' ') || undefined
  const control = {
    id: controlId,
    invalid: Boolean(error),
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': required || undefined,
  }
  return (
    <div className={clsx(styles.field, className)}>
      {label && (
        <label htmlFor={controlId} className={styles.label}>
          {label}
          {required && (
            <span aria-hidden="true" className={styles.required}>
              {' '}
              * </span>
          )}
        </label>
      )}
      {typeof children === 'function' ? children(control) : children}
      {showHint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={messageId} role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {showSuccess && (
        <p id={messageId} className={styles.success}>
          <Icon name="check2" /> {success}
        </p>
      )}
    </div>
  )
}