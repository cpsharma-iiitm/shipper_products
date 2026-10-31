import clsx from 'clsx'
import styles from './PageHeader.module.scss'
/**
* Page title block: heading, supporting line and page-level actions.
* variant: admin (24px title, content-width) | storefront (display title for account and order pages)
* `actions` is any node (usually one or two Buttons) shown on the right, wrapping below on mobile.
*/
export default function PageHeader({ title, description, eyebrow, actions, variant = 'admin', as: Heading = 'h1', className }) {
  return (
    <header className={clsx(styles.header, styles[variant], className)}>
      <div className={styles.text}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <Heading className={styles.title}>{title}</Heading>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}