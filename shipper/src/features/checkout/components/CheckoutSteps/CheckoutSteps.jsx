import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './CheckoutSteps.module.scss'

/** "Cart → Delivery & payment → Confirmation" progress line; `currentIndex` is zero-based. */
export default function CheckoutSteps({ steps, currentIndex }) {
  return (
    <ol className={styles.steps} aria-label="Checkout progress">
      {steps.map((label, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
        return (
          <li key={label} className={clsx(styles.step, styles[state])} aria-current={state === 'current' ? 'step' : undefined}>
            {state === 'done' ? <Icon name="check2" /> : <span aria-hidden="true">{index + 1}</span>}
            {label}
            <span className="visually-hidden">{state === 'done' ? ' (completed)' : state === 'current' ? ' (current step)' : ''}</span>
          </li>
        )
      })}
    </ol>
  )
}
