import { Link } from 'react-router-dom'
import clsx from 'clsx'
import pantryImage from '@/assets/storefront/pantry.jpg'
import { paths } from '@/app/router/paths'
import Button from '@/components/atoms/Button'
import ResponsiveText from '@/features/catalog/components/ResponsiveText'
import styles from './EditorialBanner.module.scss'

/** "Rooted in goodness": the grocery promo, copy left and photograph right (photograph on top on phones). */
export default function EditorialBanner() {
  return (
    <section className={clsx('sh-container', styles.section)} aria-labelledby="pantry-banner-title">
      <div className={styles.banner}>
        <div className={styles.media}>
          <img src={pantryImage} alt="" loading="lazy" className={styles.image} />
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>From our pantry to yours</p>
          <h2 id="pantry-banner-title" className={styles.title}>
            <span className={styles.line}>Rooted in goodness.</span>
            <span className={clsx(styles.line, 'd-none d-md-block')}>Made for your kitchen.</span>
          </h2>
          <p className={styles.lead}>
            <ResponsiveText desktop="Honest ingredients. Everyday nourishment." mobile="Honest ingredients for your kitchen." />
          </p>
          <Button as={Link} to={paths.category('grocery')} size="lg" rightIcon="arrow-right" className={styles.action}>
            Explore grocery
          </Button>
        </div>
      </div>
    </section>
  )
}
