import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export const PURCHASE_PAGE_SIZE = 8

const STATUS_VALUES = ['all', 'draft', 'payment_pending', 'paid', 'cancelled']
const DEFAULTS = { status: 'all', sort: '', page: 1 }

/**
 * Purchase list filters kept in the URL (?status=&sort=&page=) so a view can be linked. Changing a
 * filter returns to page 1. The search text is local state, seeded from ?q= once.
 */
export function usePurchaseFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [initialSearch] = useState(() => searchParams.get('q') ?? '')

  const status = searchParams.get('status')
  const filters = {
    status: STATUS_VALUES.includes(status) ? status : DEFAULTS.status,
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
