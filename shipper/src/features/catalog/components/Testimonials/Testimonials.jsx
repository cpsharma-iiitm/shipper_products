import clsx from 'clsx'
import RatingStars from '@/components/molecules/RatingStars'
import { TESTIMONIALS } from '@/features/catalog/content/homeContent'
import styles from './Testimonials.module.scss'

/** "Small essentials. Happy homes.": three customer quotes on desktop, one on phones. */
export default function Testimonials() {
  return (
    <section className={styles.section} aria-labelledby="testimonials-title">
      <div className="sh-container">
        <header className={styles.header}>
          <h2 id="testimonials-title" className={styles.title}>
            Small essentials. Happy homes.
          </h2>
          <p className={styles.description}>A few words from our growing community.</p>
        </header>
        <ul className={styles.grid}>
          {TESTIMONIALS.map((testimonial) => (
            <li key={testimonial.author} className={clsx(styles.card, !testimonial.showOnPhone && styles.desktopOnly)}>
              <RatingStars value={5} />
              <blockquote className={styles.quote}>
                <span className="d-none d-md-inline">“{testimonial.quote}”</span>
                <span className="d-md-none">“{testimonial.compactQuote ?? testimonial.quote}”</span>
              </blockquote>
              <p className={styles.author}>
                {testimonial.author}
                <span className="d-none d-md-inline"> · {testimonial.city}</span>
                <span className="d-md-none"> · Verified purchase</span>
              </p>
              <p className={styles.verified}>Verified purchase</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
