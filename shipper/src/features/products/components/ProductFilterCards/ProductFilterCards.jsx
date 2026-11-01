import StatCard from '@/components/molecules/StatCard'
import { formatNumber } from '@/lib/format'
import styles from './ProductFilterCards.module.scss'

// Each card is a shortcut onto the Stock and Status filters, so the cards and the dropdowns never disagree.
const CARDS = [
  { key: 'all', label: 'All products', changes: { stock: 'all', status: 'all' }, isSelected: ({ stock, status }) => stock === 'all' && status === 'all' },
  { key: 'active', label: 'Active', changes: { stock: 'all', status: 'active' }, isSelected: ({ stock, status }) => stock === 'all' && status === 'active' },
  { key: 'low', label: 'Low stock', changes: { stock: 'low' }, isSelected: ({ stock }) => stock === 'low' },
  { key: 'out', label: 'Out of stock', changes: { stock: 'out' }, isSelected: ({ stock }) => stock === 'out' },
]

/** Catalogue-wide counts that double as quick filters. Selecting the active card again shows everything. */
export default function ProductFilterCards({ counts, filters, onChange }) {
  return (
    <div className={styles.grid} role="group" aria-label="Quick filters">
      {CARDS.map((card) => {
        const selected = card.isSelected(filters)
        return (
          <StatCard
            key={card.key}
            layout="inline"
            className={styles.card}
            label={card.label}
            value={formatNumber(counts?.[card.key])}
            selected={selected}
            onClick={() => onChange(selected && card.key !== 'all' ? CARDS[0].changes : card.changes)}
          />
        )
      })}
    </div>
  )
}
