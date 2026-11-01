import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Popover from '@/components/molecules/Popover'
import styles from './PeriodMenu.module.scss'

/** "This month ⌄" button that opens the list of reporting periods the backend offers. */
export default function PeriodMenu({ value, label, options, onChange }) {
  return (
    <Popover
      align="end"
      panelClassName={styles.panel}
      trigger={({ props }) => (
        <Button size="sm" rightIcon="chevron-down" {...props}>
          {label}
        </Button>
      )}
    >
      {({ close }) => (
        <ul aria-label="Reporting period">
          {options.map((option) => (
            <li key={option.key}>
              <button
                type="button"
                className={styles.option}
                aria-pressed={option.key === value}
                onClick={() => {
                  onChange(option.key)
                  close()
                }}
              >
                {option.label}
                {option.key === value && <Icon name="check2" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  )
}
