import Button from '@/components/atoms/Button'
import Checkbox from '@/components/atoms/Checkbox'
import Popover from '@/components/molecules/Popover'
import styles from './ColumnsMenu.module.scss'

/**
 * "Columns" button with a checklist of optional table columns.
 *   options: [{ key, label }]   visible: string[] of the keys currently shown   onChange(nextKeys)
 */
export default function ColumnsMenu({ options, visible, onChange }) {
  const toggle = (key) => onChange(visible.includes(key) ? visible.filter((entry) => entry !== key) : [...visible, key])

  return (
    <Popover
      align="end"
      trigger={({ props }) => (
        <Button variant="secondary" size="sm" rightIcon="chevron-down" {...props}>
          Columns
        </Button>
      )}
    >
      <fieldset className={styles.menu}>
        <legend className={styles.legend}>Show more columns</legend>
        {options.map((option) => (
          <Checkbox key={option.key} label={option.label} checked={visible.includes(option.key)} onChange={() => toggle(option.key)} />
        ))}
      </fieldset>
    </Popover>
  )
}
