import Button from '@/components/atoms/Button'
import SearchField from '@/components/molecules/SearchField'
import SelectField from '@/components/molecules/SelectField'
import styles from './ProductToolbar.module.scss'

const STOCK_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'in', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

/** Search, Category / Stock / Status filters and the Excel export for the product list. */
export default function ProductToolbar({ searchText, onSearchChange, filters, categories = [], onFilterChange, onExport, exporting }) {
  const categoryOptions = [{ value: 'all', label: 'All' }, ...categories]

  return (
    <div className={styles.toolbar}>
      <SearchField
        className={styles.search}
        size="sm"
        value={searchText}
        onChange={onSearchChange}
        placeholder="Search code, name, HSN or batch"
        aria-label="Search products by code, name, HSN or batch"
      />
      <div className={styles.filters}>
        <div className={styles.filter}>
          <SelectField
            size="sm"
            fit
            prefixLabel="Category:"
            aria-label="Filter by category"
            options={categoryOptions}
            value={filters.category}
            onChange={(value) => onFilterChange({ category: value })}
          />
        </div>
        <div className={styles.filter}>
          <SelectField
            size="sm"
            fit
            prefixLabel="Stock:"
            aria-label="Filter by stock level"
            options={STOCK_OPTIONS}
            value={filters.stock}
            onChange={(value) => onFilterChange({ stock: value })}
          />
        </div>
        <div className={styles.filter}>
          <SelectField
            size="sm"
            fit
            prefixLabel="Status:"
            aria-label="Filter by status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(value) => onFilterChange({ status: value })}
          />
        </div>
        <Button variant="secondary" size="sm" leftIcon="download" loading={exporting} onClick={onExport}>
          Export
        </Button>
      </div>
    </div>
  )
}
