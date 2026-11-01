import SearchField from '@/components/molecules/SearchField'
import SelectField from '@/components/molecules/SelectField'
import styles from './QueueToolbar.module.scss'

/**
 * Search box plus compact filter selects, as shown above every queue.
 *   filters: [{ key, label, prefix?, options: [{ value, label }], value, onChange, disabled? }]
 * `label` names the select for assistive technology; `prefix` is the visible "Payment:" lead-in.
 */
export default function QueueToolbar({ search, onSearchChange, searchLabel, searchPlaceholder, filters = [] }) {
  return (
    <div className={styles.toolbar}>
      <SearchField
        className={styles.search}
        size="md"
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        aria-label={searchLabel ?? searchPlaceholder}
      />
      {filters.map((filter) => (
        <div key={filter.key} className={styles.filter}>
          <SelectField
            size="md"
            fit
            aria-label={filter.label}
            prefixLabel={filter.prefix}
            options={filter.options}
            value={filter.value}
            onChange={filter.onChange}
            isDisabled={filter.disabled}
          />
        </div>
      ))}
    </div>
  )
}
