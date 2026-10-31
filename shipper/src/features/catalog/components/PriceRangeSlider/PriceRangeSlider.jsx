import { useId, useState } from 'react'
import { formatINR } from '@/lib/format'
import styles from './PriceRangeSlider.module.scss'

const STEP = 5

/**
 * Two-handle price range. `bounds` is the catalogue's price range for the current search (from the API);
 * `value` is the applied range, either side may be undefined. Dragging only updates the thumbs;
 * the range is committed (and the catalogue re-queried) when the handle is released, so a drag is one request.
 * Give it a `key` built from the applied range and bounds so it resets when the URL changes.
 */
export default function PriceRangeSlider({ bounds, value, onCommit }) {
  const captionId = useId()
  const applied = { low: value.min ?? bounds.min, high: value.max ?? bounds.max }
  const [range, setRange] = useState(applied)
  const span = Math.max(1, bounds.max - bounds.min)
  const toPercent = (amount) => ((amount - bounds.min) / span) * 100

  const commit = () => {
    if (range.low === applied.low && range.high === applied.high) return
    onCommit({ min: range.low <= bounds.min ? undefined : range.low, max: range.high >= bounds.max ? undefined : range.high })
  }
  const moveLow = (event) => setRange((current) => ({ ...current, low: Math.min(Number(event.target.value), current.high - STEP) }))
  const moveHigh = (event) => setRange((current) => ({ ...current, high: Math.max(Number(event.target.value), current.low + STEP) }))

  const shared = { type: 'range', className: styles.input, min: bounds.min, max: bounds.max, step: STEP, 'aria-describedby': captionId, onPointerUp: commit, onKeyUp: commit, onBlur: commit }

  return (
    <div className={styles.slider}>
      <div className={styles.row}>
        <span className={styles.end}>{formatINR(bounds.min)}</span>
        <div className={styles.track}>
          <span className={styles.fill} style={{ left: `${toPercent(range.low)}%`, right: `${100 - toPercent(range.high)}%` }} />
          <input {...shared} value={range.low} onChange={moveLow} aria-label="Minimum price" />
          <input {...shared} value={range.high} onChange={moveHigh} aria-label="Maximum price" />
        </div>
        <span className={styles.end}>{formatINR(bounds.max)}</span>
      </div>
      <p id={captionId} className={styles.caption} aria-live="polite">
        Range: {formatINR(range.low)} – {formatINR(range.high)}
      </p>
    </div>
  )
}
