import { useId } from 'react'
import { CATEGORIES } from '@/app/config/categories'
import Checkbox from '@/components/atoms/Checkbox'
import Radio from '@/components/atoms/Radio'
import Skeleton from '@/components/atoms/Skeleton'
import RatingStars from '@/components/molecules/RatingStars'
import PriceRangeSlider from '@/features/catalog/components/PriceRangeSlider'
import { formatNumber } from '@/lib/format'
import styles from './FilterPanel.module.scss'

const MIN_RATING = 4
const MIN_DISCOUNT = 20

function Section({ title, children }) {
  const headingId = useId()
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.heading}>
        {title}
      </h3>
      {children}
    </section>
  )
}

/**
 * Category, price, availability, rating and offer filters. Controlled by the URL query: it reports
 * changes through `onChange(patch)` (URL params) and `onCategoryChange(slug | null)`.
 * `facets` come from the catalogue response; until they arrive the categories show without counts.
 */
export default function FilterPanel({ query, facets, onChange, onCategoryChange }) {
  const groupName = useId()
  const counts = new Map((facets?.categories ?? []).map((category) => [category.slug, category.count]))
  const total = facets ? facets.categories.reduce((sum, category) => sum + category.count, 0) : null
  const withCount = (label, count) => (count === undefined || count === null ? label : `${label} (${formatNumber(count)})`)
  const bounds = facets?.priceBounds

  return (
    <div className={styles.panel}>
      <Section title="Category">
        <div className={styles.options}>
          <Radio
            name={`${groupName}-category`}
            label={withCount('All essentials', total)}
            checked={!query.category}
            onChange={() => onCategoryChange(null)}
          />
          {CATEGORIES.map((category) => (
            <Radio
              key={category.slug}
              name={`${groupName}-category`}
              label={withCount(category.label, counts.get(category.slug))}
              checked={query.category === category.slug}
              onChange={() => onCategoryChange(category.slug)}
            />
          ))}
        </div>
      </Section>

      <Section title="Price">
        {bounds && bounds.max > bounds.min ? (
          <PriceRangeSlider
            key={`${bounds.min}-${bounds.max}-${query.minPrice}-${query.maxPrice}`}
            bounds={bounds}
            value={{ min: query.minPrice, max: query.maxPrice }}
            onCommit={({ min, max }) => onChange({ minPrice: min, maxPrice: max })}
          />
        ) : (
          <Skeleton height="3.5rem" />
        )}
      </Section>

      <Section title="Availability">
        <div className={styles.options}>
          <Radio name={`${groupName}-stock`} label="In stock" checked={Boolean(query.inStock)} onChange={() => onChange({ inStock: true })} />
          <Radio
            name={`${groupName}-stock`}
            label="Include sold out"
            checked={!query.inStock}
            onChange={() => onChange({ inStock: undefined })}
          />
        </div>
      </Section>

      <Section title="Customer rating">
        <Checkbox
          label={
            <span className={styles.rating}>
              <RatingStars value={MIN_RATING} tone="warning" size="sm" /> &amp; above
            </span>
          }
          checked={query.minRating === MIN_RATING}
          onChange={(event) => onChange({ minRating: event.target.checked ? MIN_RATING : undefined })}
        />
      </Section>

      <Section title="Offers">
        <div className={styles.options}>
          <Checkbox
            label={`${MIN_DISCOUNT}% off or more`}
            checked={query.minDiscount === MIN_DISCOUNT}
            onChange={(event) => onChange({ minDiscount: event.target.checked ? MIN_DISCOUNT : undefined })}
          />
          <Checkbox
            label="Wallet rewards"
            checked={Boolean(query.walletRewards)}
            onChange={(event) => onChange({ walletRewards: event.target.checked || undefined })}
          />
        </div>
      </Section>
    </div>
  )
}
