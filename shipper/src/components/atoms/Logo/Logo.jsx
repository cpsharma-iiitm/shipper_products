import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './Logo.module.scss'
/**
* Brand mark + "Shipper.com" wordmark. Render as a link with `as={Link} to="/"`.
* size: lg (storefront header and footer) | md (admin sidebar and mobile) inverted: white wordmark
*/
export default function Logo({ as: Component = 'span', size = 'lg', inverted = false, markOnly = false, className, ...rest }) {
  return (
    <Component className={clsx(styles.logo, styles[size], inverted && styles.inverted, className)} {...rest}>
      <span className={styles.mark} aria-hidden="true">
        <Icon name="box-seam" />
      </span>
      {markOnly ? <span className="visually-hidden">Shipper.com</span> : <span className={styles.wordmark}>Shipper.com</span>}
    </Component>
  )
}