import { useState } from 'react'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Icon from '@/components/atoms/Icon'
import { formatDate } from '@/lib/date'
import { formatNumber } from '@/lib/format'
import styles from './ReviewsCard.module.scss'

/** Rating summary with the latest review; "Read all reviews" opens the rest of the sample. */
export default function ReviewsCard({ reviews, className }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? reviews.highlights : reviews.highlights.slice(0, 1)

  return (
    <Card title="What our customers say" className={className}>
      <div className={styles.score}>
        <span className={styles.value}>{reviews.average.toFixed(1)} / 5</span>
        <span role="img" aria-label={`Rated ${reviews.average.toFixed(1)} out of 5`} className={styles.stars}>
          {Array.from({ length: 5 }, (_, index) => (
            <Icon key={index} name="star-fill" />
          ))}
        </span>
      </div>
      <p className={styles.basis}>Based on {formatNumber(reviews.count)} verified purchases</p>

      <ul className={styles.list} id="product-reviews">
        {visible.map((review) => (
          <li key={`${review.author}-${review.reviewedAt}`} className={styles.review}>
            <blockquote className={styles.quote}>“{review.quote}”</blockquote>
            <p className={styles.author}>
              {review.author} · {formatDate(review.reviewedAt)}
            </p>
            {review.verified && (
              <Badge tone="success" className={styles.verified}>
                Verified purchase
              </Badge>
            )}
          </li>
        ))}
      </ul>

      {reviews.highlights.length > 1 && (
        <Button
          variant="link"
          className={styles.toggle}
          rightIcon={showAll ? undefined : 'arrow-right'}
          aria-expanded={showAll}
          aria-controls="product-reviews"
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? 'Show fewer reviews' : 'Read all reviews'}
        </Button>
      )}
    </Card>
  )
}
