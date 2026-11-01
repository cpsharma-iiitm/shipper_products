import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export const PRODUCT_PAGE_SIZE = 6

const STOCK_VALUES = ['all', 'in', 'low', 'out']
const STATUS_VALUES = ['all', 'active', 'inactive']
const DEFAULTS = { category: 'all', stock: 'all', status: 'all', sort: '', page: 1 }

const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback)

/**
 * Product list filters kept in the URL (?category=&stock=&status=&sort=&page=) so a filtered view can
 * be bookmarked or linked from a notification (for example /admin/products?stock=low). Changing any
 * filter returns to page 1. The search text is local state, seeded from ?q= once.
 */
export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [initialSearch] = useState(() => searchParams.get('q') ?? '')

  const filters = {
    category: searchParams.get('category') ?? DEFAULTS.category,
    stock: oneOf(searchParams.get('stock'), STOCK_VALUES, DEFAULTS.stock),
    status: oneOf(searchParams.get('status'), STATUS_VALUES, DEFAULTS.status),
    sort: searchParams.get('sort') ?? DEFAULTS.sort,
    page: Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1),
  }

  const update = useCallback(
    (changes) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (!('page' in changes)) next.delete('page')
          Object.entries(changes).forEach(([key, value]) => {
            if (value === undefined || value === null || value === DEFAULTS[key]) next.delete(key)
            else next.set(key, String(value))
          })
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { filters, update, initialSearch }
}
