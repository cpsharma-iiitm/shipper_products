import { useId } from 'react'
import clsx from 'clsx'
import styles from './Radio.module.scss'
/** Radio button with an optional visible label; give related radios the same `name`. */
export default function Radio({ ref, label, hint, className, id, ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <span className={clsx(styles.root, className)}>
      <input ref={ref} id={inputId} type="radio" className={styles.control} {...rest} />
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {hint && <span className={styles.hint}> {hint}</span>}
        </label>
      )}
    </span>
  )
}