import { useEffect, useId, useMemo, useRef } from 'react'
import clsx from 'clsx'
import { mergeRefs } from '@/lib/mergeRefs'
import styles from './Checkbox.module.scss'
/**
* Checkbox with an optional visible label. When there is no `label` (for example a table row
* selector) pass `aria-label` so the control still has an accessible name.
*/
export default function Checkbox({ ref, label, hint, indeterminate = false, invalid = false, className, id, ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const innerRef = useRef(null)
  const setRefs = useMemo(() => mergeRefs(innerRef, ref), [ref])
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <span className={clsx(styles.root, className)}>
      <input
        ref={setRefs}
        id={inputId}
        type="checkbox"
        className={clsx(styles.control, invalid && styles.invalid)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {hint && <span className={styles.hint}> {hint}</span>}
        </label>
      )}
    </span>
  )
}