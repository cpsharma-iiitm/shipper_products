import clsx from 'clsx'
import Button from '@/components/atoms/Button'
import SearchField from '@/components/molecules/SearchField'
import SelectField from '@/components/molecules/SelectField'
import styles from './ListToolbar.module.scss'
 
/**
 * The filter row above an admin list (see the Products screen): a search box, any number of toolbar selects
 * ("Status: All") and trailing actions such as Export. State comes from useListParams.
 *
 *   search:  { value, onChange }, plus `label` and `placeholder` for the field
 *   filters: [{ key, label, prefix, options, value, onChange(value), searchable? } | { key, node }]
 *   `label` names the select for assistive technology; `prefix` is the visible "Status:" text;
 *   `node` places a custom control (the date-range button) among the selects.
 * `onClear` shows a "Clear filters" button while `hasActiveFilters` is true.
 */
export default function ListToolbar({ search, filters = [], hasActiveFilters = false, onClear, children, className }) {
  return (
    <div className={clsx(styles.toolbar, className)}>
      <SearchField
        size="sm"
        className={styles.search}
        aria-label={search.label}
        placeholder={search.placeholder}
        value={search.value}
        onChange={search.onChange}
      />
      {filters.map((filter) =>
        filter.node ? (
          <div key={filter.key} className={styles.node}>
            {filter.node}
          </div>
        ) : (
          <div key={filter.key} className={styles.filter}>
            <SelectField
              size="sm"
              fit
              aria-label={filter.label}
              prefixLabel={filter.prefix}
              options={filter.options}
              value={filter.value}
              onChange={(value) => filter.onChange(value ?? '')}
              isSearchable={filter.searchable}
            />
          </div>
        ),
      )}
      {hasActiveFilters && onClear && (
        <Button variant="ghost" size="sm" leftIcon="x-lg" onClick={onClear}>
          Clear filters
        </Button>
      )}
      {children}
    </div>
  )
}