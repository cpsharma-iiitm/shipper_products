import { CATEGORIES } from '@/app/config/categories'

export const RESTOCK_LEVEL_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
]

export const RESTOCK_CATEGORY_OPTIONS = [{ value: '', label: 'All' }, ...CATEGORIES.map((category) => ({ value: category.slug, label: category.label }))]
