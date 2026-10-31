import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './Stepper.module.scss'

/** Horizontal progress (e.g. Address → Payment → Review). `currentIndex` is zero-based. */
export default function Stepper({ steps, currentIndex, className }) {
  return (
    <ol className={clsx(styles.stepper, className)}>
      {steps.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
        return (
          <li key={step.key} className={clsx(styles.step, styles[state])} aria-current={state === 'current' ? 'step' : undefined}>
            <span className={styles.marker}>{state === 'done' ? <Icon name="check-lg" /> : index + 1}</span>
            <span className={styles.label}>
              {step.label}
              <span className="visually-hidden">{state === 'done' ? ' (completed)' : state === 'current' ? ' (current step)' : ''}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}