import { useId, useState } from 'react'
import clsx from 'clsx'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Input from '@/components/atoms/Input'
import Popover from '@/components/molecules/Popover'
import { formatDate, formatDateRange } from '@/lib/date'
import styles from './DateRangeFilter.module.scss'

/** "01–28 Oct 2026" when both days share a month, otherwise the full range. */
function compactRange(from, to) {
    const [fromDay, fromMonth, fromYear] = formatDate(from).split(' ')
    const [toDay, toMonth, toYear] = formatDate(to).split(' ')
    if (fromMonth !== toMonth || fromYear !== toYear) return formatDateRange(from, to)
    return fromDay === toDay ? formatDate(to) : `${fromDay}–${toDay} ${toMonth} ${toYear}`
}

function CustomRange({ initialFrom, initialTo, onApply }) {
    const [from, setFrom] = useState(initialFrom)
    const [to, setTo] = useState(initialTo)
    const [error, setError] = useState('')
    const errorId = useId()

    const apply = (event) => {
        event.preventDefault()
        if (!from || !to || from > to) {
            setError('Choose a start date that is on or before the end date.')
            return
        }
        onApply({ from, to })
    }

    return (
        <form className={styles.custom} onSubmit={apply} noValidate>
            <p className={styles.customTitle}>Custom range</p>
            <div className={styles.customFields}>
                <label className={styles.customField}>
                    From
                    <Input size="sm" type="date" value={from} aria-describedby={error ? errorId : undefined} onChange={(event) => setFrom(event.target.value)} />
                </label>
                <label className={styles.customField}>
                    To
                    <Input size="sm" type="date" value={to} aria-describedby={error ? errorId : undefined} onChange={(event) => setTo(event.target.value)} />
                </label>
            </div>
            {error && (
                <p id={errorId} role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            <Button type="submit" size="sm" fullWidth>
                Apply
            </Button>
        </form>
    )
}

/**
 * Date-range button with a popover of preset ranges and a custom From / To range.
 *
 *   value:   { range, from, to }       the active preset key, or 'custom' with its two ISO dates
 *   period:  { from, to } | null       the range the backend resolved the preset to; shown on the button
 *   onChange({ range, from, to })      a preset passes empty dates, Apply passes range 'custom'
 *   presets: [{ value, label }]        see constants/dateRanges
 * The browser never works out "last 7 days" itself: it sends the preset key and the backend resolves it.
 */
export default function DateRangeFilter({ value, period, presets, onChange, label = 'Date range', prefix, compact = false, className }) {
    const preset = presets.find((entry) => entry.value === value.range)
    const resolved = period ?? (value.range === 'custom' && value.from && value.to ? value : null)
    const text = resolved ? (compact ? compactRange(resolved.from, resolved.to) : formatDateRange(resolved.from, resolved.to)) : (preset?.label ?? 'Custom range')

    return (
        <Popover
            className={className}
            align="end"
            panelClassName={styles.panel}
            trigger={({ props, isOpen }) => (
                <button type="button" className={clsx(styles.trigger, isOpen && styles.open)} aria-label={`${label}: ${text}`} {...props}>
                    {prefix && <span className={styles.prefix}>{prefix}</span>}
                    {text}
                    <Icon name="chevron-down" />
                </button>
            )}
        >
            {({ close }) => (
                <>
                    <ul className={styles.presets}>
                        {presets.map((entry) => (
                            <li key={entry.value}>
                                <button
                                    type="button"
                                    className={clsx(styles.preset, entry.value === value.range && styles.selected)}
                                    aria-pressed={entry.value === value.range}
                                    onClick={() => {
                                        onChange({ range: entry.value, from: '', to: '' })
                                        close()
                                    }}
                                >
                                    {entry.label}
                                    {entry.value === value.range && <Icon name="check-lg" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <CustomRange
                        initialFrom={value.range === 'custom' ? value.from : (period?.from ?? '')}
                        initialTo={value.range === 'custom' ? value.to : (period?.to ?? '')}
                        onApply={(range) => {
                            onChange({ range: 'custom', ...range })
                            close()
                        }}
                    />
                </>
            )}
        </Popover>
    )
}