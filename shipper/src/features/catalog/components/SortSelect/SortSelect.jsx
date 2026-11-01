import SelectField from '@/components/molecules/SelectField'
import { SORT_OPTIONS } from '@/features/catalog/hooks/useProductFilters'

/** "Sort: Recommended" dropdown. */
export default function SortSelect({ value, onChange, size = 'lg' }) {
  return (
    <SelectField
      aria-label="Sort products"
      prefixLabel="Sort:"
      size={size}
      options={SORT_OPTIONS}
      value={value}
      onChange={(next) => onChange(next ?? 'recommended')}
    />
  )
}
