import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import { formatNumber, toNumber } from '@/lib/format'
import styles from './RatingStars.module.scss'

const STAR_COUNT = 5

function starName(index, rating) {
  if (rating >= index + 1) return 'star-fill'
  if (rating >= index + 0.5) return 'star-half'
  return 'star'
}

/** Read-only rating. tone: primary (testimonials) | warning (filters). `count` shows review volume. */
export default function RatingStars({
  value,
  count,
  showValue = false,
  tone = 'primary',
  size = 'md',
  className,
}) {
  const parsedRating = toNumber(value)

  const rating = Number.isFinite(parsedRating)
    ? Math.min(STAR_COUNT, Math.max(0, parsedRating))
    : 0

  const countNumber = toNumber(count)

  return (
    <span className={clsx(styles.rating, styles[tone], styles[size], className)}>
      <span
        role="img"
        aria-label={`Rated ${rating} out of ${STAR_COUNT}`}
        className={styles.stars}
      >
        {Array.from({ length: STAR_COUNT }, (_, index) => (
          <Icon key={index} name={starName(index, rating)} />
        ))}
      </span>

      {showValue && (
        <span className={styles.value}>{rating.toFixed(1)}</span>
      )}

      {countNumber != null && (
        <span className={styles.count}>
          ({formatNumber(countNumber)})
        </span>
      )}
    </span>
  )
}
