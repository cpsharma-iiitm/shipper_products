import { useId } from 'react'
import clsx from 'clsx'
import styles from './Card.module.scss'
const PADDING_CLASS = { none: styles.paddingNone, sm: styles.paddingSm, md: styles.paddingMd, lg: styles.paddingLg }
const RADIUS_CLASS = { md: styles.radiusMd, lg: styles.radiusLg }
/**
* Bordered surface used for checkout sections, order cards, admin panels and summaries.
* padding: none | sm | md | lg radius: md (admin) | lg (storefront)
* `title` renders a heading (level via `titleAs`) and labels the section for assistive tech.
*/
export default function Card({
  as: Component = 'section',
  title,
  titleAs: Title = 'h2',
  actions,
  padding = 'md',
  radius = 'lg',
  className,
  children,
  ...rest
}) {
  const titleId = useId()
  return (
    <Component
      className={clsx(styles.card, PADDING_CLASS[padding], RADIUS_CLASS[radius], className)}
      aria-labelledby={title ? titleId : undefined}
      {...rest}
    >
      {(title || actions) && (
        <header className={styles.header}>
          {title && (
            <Title id={titleId} className={styles.title}>
              {title}
            </Title>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      {children}
    </Component>
  )
}