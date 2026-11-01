import { useState } from 'react'
import clsx from 'clsx'
import { formatINR } from '@/lib/format'
import { monotonePath } from './monotonePath'
import styles from './RevenueChart.module.scss'

const WIDTH = 1000
const HEIGHT = 200
const GRID_LINES = 4

/** x-axis labels: every 5th day on long ranges, every day on a week; the last label is always kept. */
function pickTickIndexes(count) {
  const step = count > 14 ? 5 : 1
  const indexes = Array.from({ length: count }, (_, index) => index).filter((index) => index === 0 || (index + 1) % step === 0)
  const last = count - 1
  if (indexes.at(-1) !== last) {
    if (last - indexes.at(-1) < 3) indexes.pop()
    indexes.push(last)
  }
  return indexes
}

/**
 * Two-series line chart (current period vs the one before) drawn in SVG; there is no chart library.
 * Hover, touch or the arrow keys inspect a day; a visually hidden table carries the same figures for
 * screen readers. All values come from the backend and are only formatted here.
 *
 * points: [{ label, previousLabel, current, previous }]
 */
export default function RevenueChart({ points, currentLabel, previousLabel, metricLabel = 'Revenue' }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const last = points.length - 1

  const values = points.flatMap((point) => [point.current, point.previous])
  const floor = Math.min(...values) * 0.85
  const ceiling = Math.max(...values) * 1.04
  const xOf = (index) => (last === 0 ? WIDTH / 2 : (index / last) * WIDTH)
  const yOf = (value) => HEIGHT - ((value - floor) / (ceiling - floor)) * HEIGHT
  const pathOf = (key) => monotonePath(points.map((point, index) => [xOf(index), yOf(point[key])]))

  const active = activeIndex === null ? null : points[activeIndex]
  const percentOf = (index) => (last === 0 ? 50 : (index / last) * 100)

  const inspectFromPointer = (event) => {
    const box = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width))
    setActiveIndex(Math.round(ratio * last))
  }

  const handleKeyDown = (event) => {
    const moves = {
      ArrowLeft: Math.max(0, (activeIndex ?? last) - 1),
      ArrowRight: Math.min(last, (activeIndex ?? last) + 1),
      Home: 0,
      End: last,
    }
    if (moves[event.key] === undefined) return
    event.preventDefault()
    setActiveIndex(moves[event.key])
  }

  const tickIndexes = pickTickIndexes(points.length)
  const summary = `${metricLabel} by day. ${currentLabel}: ${formatINR(points[0].current)} on ${points[0].label} to ${formatINR(points[last].current)} on ${points[last].label}.`

  return (
    <figure className={styles.chart}>
      <div
        className={styles.plot}
        tabIndex={0}
        role="group"
        aria-label={`${summary} Use the left and right arrow keys to read each day.`}
        onPointerMove={inspectFromPointer}
        onPointerDown={inspectFromPointer}
        onPointerLeave={() => setActiveIndex(null)}
        onFocus={() => setActiveIndex((current) => current ?? last)}
        onBlur={() => setActiveIndex(null)}
        onKeyDown={handleKeyDown}
      >
        <svg className={styles.svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {Array.from({ length: GRID_LINES }, (_, index) => {
            const y = (index / (GRID_LINES - 1)) * HEIGHT
            return <line key={index} className={styles.grid} x1="0" x2={WIDTH} y1={y} y2={y} />
          })}
          <path className={styles.previousLine} d={pathOf('previous')} />
          <path className={styles.currentLine} d={pathOf('current')} />
        </svg>

        {active && (
          <>
            <span className={styles.guide} style={{ left: `${percentOf(activeIndex)}%` }} aria-hidden="true" />
            <span
              className={clsx(styles.dot, styles.previousDot)}
              style={{ left: `${percentOf(activeIndex)}%`, top: `${(yOf(active.previous) / HEIGHT) * 100}%` }}
              aria-hidden="true"
            />
            <span
              className={clsx(styles.dot, styles.currentDot)}
              style={{ left: `${percentOf(activeIndex)}%`, top: `${(yOf(active.current) / HEIGHT) * 100}%` }}
              aria-hidden="true"
            />
            <div
              className={clsx(styles.tooltip, activeIndex / Math.max(1, last) > 0.8 && styles.tooltipLeft, activeIndex / Math.max(1, last) < 0.2 && styles.tooltipRight)}
              style={{ left: `${percentOf(activeIndex)}%` }}
              aria-hidden="true"
            >
              <strong className={styles.tooltipTitle}>{active.label}</strong>
              <span className={styles.tooltipRow}>
                <span className={clsx(styles.swatch, styles.currentSwatch)} />
                {currentLabel}
                <b>{formatINR(active.current)}</b>
              </span>
              <span className={styles.tooltipRow}>
                <span className={clsx(styles.swatch, styles.previousSwatch)} />
                {previousLabel} · {active.previousLabel}
                <b>{formatINR(active.previous)}</b>
              </span>
            </div>
          </>
        )}
      </div>

      <div className={styles.axis} aria-hidden="true">
        {tickIndexes.map((index) => (
          <span
            key={index}
            className={clsx(styles.tick, index === 0 && styles.tickFirst, index === last && styles.tickLast)}
            style={{ left: `${percentOf(index)}%` }}
          >
            {points[index].label}
          </span>
        ))}
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {active && `${active.label}: ${currentLabel} ${formatINR(active.current)}, ${previousLabel} ${formatINR(active.previous)}.`}
      </p>

      <div className="visually-hidden">
        <table>
          <caption>
            {metricLabel} by day, {currentLabel} compared with {previousLabel}
          </caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">{currentLabel}</th>
              <th scope="col">{previousLabel}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.label}>
                <th scope="row">{point.label}</th>
                <td>{formatINR(point.current)}</td>
                <td>{formatINR(point.previous)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
