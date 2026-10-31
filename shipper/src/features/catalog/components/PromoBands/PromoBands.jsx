import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { paths } from '@/app/router/paths'
import Icon from '@/components/atoms/Icon'
import ResponsiveText from '@/features/catalog/components/ResponsiveText'
import styles from './PromoBands.module.scss'

/** Two offer bands under the category tiles; phones show only the welcome offer. */
export default function PromoBands() {
  return (
    <section className={clsx('sh-container', styles.section)} aria-label="Offers">
      <div className={styles.grid}>
        <Link to={paths.offers} className={clsx(styles.band, styles.welcome)}>
          <div className={styles.text}>
            <p className={styles.eyebrow}>
              <ResponsiveText desktop="A little welcome from us." mobile="A little welcome from us" />
            </p>
            <h2 className={styles.title}>
              <ResponsiveText desktop="10% off your first order" mobile="Your first order, 10% off." />
            </h2>
            <p className={styles.detail}>
              <ResponsiveText desktop="Use HELLO10 · Up to ₹100 off · Min. ₹699" mobile="Use HELLO10 · Min. ₹699 · Up to ₹100" />
            </p>
            <span className={styles.phoneLink}>
              Find your favourites <Icon name="arrow-right" />
            </span>
          </div>
          <Icon name="arrow-up-right" className={styles.arrow} />
        </Link>

        <Link to={paths.category('personal-care')} className={clsx(styles.band, styles.routine)}>
          <div className={styles.text}>
            <p className={styles.eyebrow}>Your routine. More rewarding.</p>
            <h2 className={styles.title}>Up to 20% off personal care</h2>
            <p className={styles.detail}>Shampoo, skincare &amp; small daily luxuries</p>
          </div>
          <Icon name="arrow-up-right" className={styles.arrow} />
        </Link>
      </div>
    </section>
  )
}
