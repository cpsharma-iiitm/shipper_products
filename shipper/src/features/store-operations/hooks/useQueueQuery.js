import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

/**
 * Search, filter and page state of one queue. `state` drives the inputs; `params` (search debounced, merged
 * with `fixed`) is what is sent to the API. Any change to the search or a filter returns to page 1.
 */
export function useQueueQuery({ defaults = {}, fixed = {}, pageSize }) {
  const [state, setState] = useState({ search: '', ...defaults, page: 1 })
  const search = useDebouncedValue(state.search, 300)

  const update = (patch) => setState((current) => ({ ...current, page: 1, ...patch }))
  const setPage = (page) => setState((current) => ({ ...current, page }))

  const { page, ...filters } = state
  const params = { ...filters, ...fixed, search: search.trim(), page, pageSize }
  // Selections and the focused order are only meaningful for one set of filters.
  const filterKey = JSON.stringify({ ...filters, search: search.trim() })

  return { state, params, filterKey, update, setPage }
}
