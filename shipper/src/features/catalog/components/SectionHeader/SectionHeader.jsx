import clsx from 'clsx'
import styles from './SectionHeader.module.scss'

/**
 * Home-page section heading: title, supporting line (desktop only, as designed) and an optional action
 * on the right. `title` and `action` may carry separate phone and desktop wording.
 */
export default function SectionHeader({ id, title, description, action, className }) {
  return (
    <header className={clsx(styles.header, className)}>
      <div className={styles.text}>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action}
    </header>
  )
}
