import Icon from '@/components/atoms/Icon'
import { TRUST_POINTS } from '@/features/catalog/content/homeContent'
import styles from './TrustStrip.module.scss'

/** Four reassurance points under the hero; phones get the three short ones. */
export default function TrustStrip() {
  return (
    <section className={styles.strip} aria-label="Why shop with us">
      <ul className={styles.list}>
        {TRUST_POINTS.map((point) => (
          <li key={point.title} className={point.shortTitle ? styles.item : styles.desktopOnly}>
            <span className={styles.full}>
              <Icon name={point.icon} className={styles.icon} />
              <span className={styles.text}>
                <span className={styles.title}>{point.title}</span>
                <span className={styles.detail}>{point.detail}</span>
              </span>
            </span>
            {point.shortTitle && (
              <span className={styles.short}>
                <Icon name={point.shortIcon} />
                {point.shortTitle}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
