import { Link } from 'react-router-dom'
import desktopImage from '@/assets/storefront/hero.jpg'
import phoneImage from '@/assets/storefront/group-blocks.jpg'
import { paths } from '@/app/router/paths'
import Button from '@/components/atoms/Button'
import ResponsiveText from '@/features/catalog/components/ResponsiveText'
import styles from './HomeHero.module.scss'

/** Home hero: headline, the two entry actions and the lifestyle photograph. */
export default function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>The everyday, elevated</p>
        <h1 id="home-hero-title" className={styles.title}>
          <span className={styles.line}>Little essentials.</span>
          <span className={styles.line}>Better every day.</span>
        </h1>
        <p className={styles.lead}>
          <ResponsiveText
            desktop="From the goodness of golden haldi to your new daily rituals. Discover quality that feels right, at prices that do too."
            mobile="Thoughtful finds. Honest prices. A little goodness, delivered."
          />
        </p>
        <div className={styles.actions}>
          <Button as={Link} to={paths.shop} size="lg" rightIcon="arrow-right">
            Discover the collection
          </Button>
          <Button as={Link} to={paths.offers} variant="secondary" size="lg" className="d-none d-md-inline-flex">
            Explore offers
          </Button>
        </div>
        <p className={styles.note}>Curated for your home. Delivered across India.</p>
      </div>
      <picture className={styles.picture}>
        <source media="(min-width: 768px)" srcSet={desktopImage} />
        <img src={phoneImage} alt="Turmeric blend, botanical shampoo and a face care tube arranged on soft blue blocks" className={styles.image} />
      </picture>
    </section>
  )
}
