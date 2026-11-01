import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { axisLabelIndexes, monotonePath, niceTicks } from './chartMath'
import styles from './LineChart.module.scss'

const MARGIN = { top: 12, right: 12, bottom: 30, left: 48 }
const compactNumber = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 })
const formatTick = (value) => (value === 0 ? '₹0' : `₹${compactNumber.format(value)}`)

function useElementWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, width]
}

const extremes = (points) => ({
  high: points.reduce((best, point) => (point.value > best.value ? point : best), points[0]),
  low: points.reduce((best, point) => (point.value < best.value ? point : best), points[0]),
})

/**
 * Accessible line chart drawn in SVG (the project has no chart library).
 *
 *   series: [{ key, label, variant: 'current' | 'previous', total?, points: [{ label, axisLabel, value }] }]
 * Every series has the same number of points, aligned by index. `value`s and `total` come from the backend;
 * the chart only positions them. `formatValue` renders money in the tooltip, the summary and the table.
 *
 * Reading the data without a mouse: the chart is focusable and ←/→/Home/End step through the days, the
 * values are announced, and a visually hidden table lists every point. Tooltips only repeat what the table says.
 */
export default function LineChart({ title, yAxisLabel, series, formatValue, busy = false, height = 240, className }) {
  const [containerRef, width] = useElementWidth()
  const [active, setActive] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  const primary = series[0]
  const count = primary.points.length
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0)
  const plotHeight = height - MARGIN.top - MARGIN.bottom
  const maxValue = Math.max(...series.flatMap((entry) => entry.points.map((point) => point.value)))
  const ticks = niceTicks(maxValue)
  const top = ticks[ticks.length - 1]

  const xAt = (index) => MARGIN.left + (count === 1 ? plotWidth / 2 : (index * plotWidth) / (count - 1))
  const yAt = (value) => MARGIN.top + plotHeight * (1 - value / top)

  const summary = [
    title,
    ...series.map((entry) => {
      const { high, low } = extremes(entry.points)
      const total = entry.total === undefined ? '' : `total ${formatValue(entry.total)}, `
      return `${entry.label}: ${total}highest ${formatValue(high.value)} on ${high.label}, lowest ${formatValue(low.value)} on ${low.label}.`
    }),
  ].join(' ')

  const describe = (index) =>
    series.map((entry) => `${entry.label} ${entry.points[index].label}: ${formatValue(entry.points[index].value)}`).join('. ')

  const handlePointerMove = (event) => {
    // The hit area starts at the left edge of the plot, so its own box is the reference.
    const box = event.currentTarget.getBoundingClientRect()
    const ratio = plotWidth === 0 ? 0 : (event.clientX - box.left) / plotWidth
    setActive(Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1)))))
  }

  const handleKeyDown = (event) => {
    const current = active ?? count - 1
    const next = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: count - 1 }[event.key]
    if (next === undefined) return
    event.preventDefault()
    const index = Math.min(count - 1, Math.max(0, next))
    setActive(index)
    setAnnouncement(describe(index))
  }

  const tooltipOnLeft = active !== null && xAt(active) > width * 0.6

  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.legendRow}>
        <p className={styles.axisTitle}>{yAxisLabel}</p>
        <ul className={styles.legend}>
          {series.map((entry) => (
            <li key={entry.key} className={styles.legendItem}>
              <span className={clsx(styles.legendKey, styles[entry.variant])} aria-hidden="true" />
              {entry.label}
            </li>
          ))}
        </ul>
      </div>

      <div
        ref={containerRef}
        className={clsx(styles.chart, busy && styles.busy)}
        style={{ height }}
        role="group"
        aria-label={`${summary} Use the left and right arrow keys to read each day.`}
        aria-busy={busy || undefined}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setActive((current) => current ?? count - 1)}
        onBlur={() => setActive(null)}
      >
        {width > 0 && (
          <svg width={width} height={height} aria-hidden="true" focusable="false">
            {ticks.map((tick) => (
              <g key={tick}>
                <line className={styles.grid} x1={MARGIN.left} x2={width - MARGIN.right} y1={yAt(tick)} y2={yAt(tick)} />
                <text className={styles.tick} x={MARGIN.left - 8} y={yAt(tick)} textAnchor="end" dominantBaseline="middle">
                  {formatTick(tick)}
                </text>
              </g>
            ))}
            {axisLabelIndexes(count).map((index, position, all) => (
              <text
                key={index}
                className={styles.tick}
                x={xAt(index)}
                y={height - 8}
                textAnchor={position === 0 ? 'start' : position === all.length - 1 ? 'end' : 'middle'}
              >
                {primary.points[index].axisLabel}
              </text>
            ))}
            {[...series].reverse().map((entry) => (
              <path
                key={entry.key}
                className={clsx(styles.line, styles[entry.variant])}
                d={monotonePath(entry.points.map((point, index) => ({ x: xAt(index), y: yAt(point.value) })))}
              />
            ))}
            {active !== null && (
              <g>
                <line className={styles.crosshair} x1={xAt(active)} x2={xAt(active)} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />
                {series.map((entry) => (
                  <circle key={entry.key} className={clsx(styles.marker, styles[entry.variant])} cx={xAt(active)} cy={yAt(entry.points[active].value)} r={5} />
                ))}
              </g>
            )}
            <rect
              className={styles.hit}
              x={MARGIN.left}
              y={0}
              width={plotWidth}
              height={height}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setActive(null)}
            />
          </svg>
        )}

        {active !== null && width > 0 && (
          <div
            className={clsx(styles.tooltip, tooltipOnLeft && styles.tooltipLeft)}
            style={{ left: xAt(active) }}
            aria-hidden="true"
          >
            <p className={styles.tooltipTitle}>{primary.points[active].label}</p>
            {series.map((entry) => (
              <p key={entry.key} className={styles.tooltipRow}>
                <span className={clsx(styles.tooltipKey, styles[entry.variant])} />
                <strong className={styles.tooltipValue}>{formatValue(entry.points[active].value)}</strong>
                <span className={styles.tooltipSeries}>
                  {entry.label}
                  {entry.points[active].label !== primary.points[active].label && ` · ${entry.points[active].label}`}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      {/* The wrapper does the clipping: a 1px table would still grow the page. */}
      <div className="visually-hidden">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              {series.map((entry) => (
                <th key={entry.key} scope="col">
                  {entry.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {primary.points.map((point, index) => (
              <tr key={point.label}>
                <th scope="row">{point.label}</th>
                {series.map((entry) => (
                  <td key={entry.key}>{formatValue(entry.points[index].value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
