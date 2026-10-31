import { Link } from 'react-router-dom'
import clsx from 'clsx'
import kitchenImage from '@/assets/storefront/kitchen.jpg'
import { paths } from '@/app/router/paths'
import Button from '@/components/atoms/Button'
import styles from './PromiseSection.module.scss'

/** "The Shipper promise": brand statement beside a kitchen photograph. Not shown on phones. */
export default function PromiseSection() {
  return (
    <section className={clsx('sh-container', styles.section)} aria-labelledby="promise-title">
      <div className={styles.grid}>
        <img src={kitchenImage} alt="Hands pouring turmeric powder into a small bowl on a sunlit kitchen counter" loading="lazy" className={styles.image} />
        <div className={styles.copy}>
          <p className={styles.eyebrow}>The Shipper promise</p>
          <h2 id="promise-title" className={styles.title}>
            <span className={styles.line}>Good choices shouldn’t</span>
            <span className={styles.line}>be complicated.</span>
          </h2>
          <p className={styles.lead}>
            We bring together honest ingredients, trusted everyday products and thoughtful prices. So you can spend less time searching, and more time living.
          </p>
          <Button as={Link} to={paths.shop} variant="secondary" size="lg" rightIcon="arrow-right">
            Get to know Shipper.com
          </Button>
        </div>
      </div>
    </section>
  )
}
