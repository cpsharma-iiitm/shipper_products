import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
 
const SEARCH_DELAY_MS = 350
const DEFAULT_PAGE_SIZE = 10
 
const parseSort = (sort) => (sort ? { key: sort.replace(/^-/, ''), direction: sort.startsWith('-') ? 'desc' : 'asc' } : null)
 
/**
 * Keeps a list screen's search, filters, sort and page in the URL, so a filtered view can be bookmarked,
 * shared and survives a refresh. Every change replaces the history entry and returns to page 1.
 *
 *   const list = useListParams({ filters: { status: '', payment: '' }, pageSize: 10 })
 *   list.filters.status            resolved value (URL value, else the default)
 *   list.apiParams                 { q, page, pageSize, sort, ...filters } without empty values, for the request
 *   list.sortState / list.setSort  DataTable's { key, direction } | null
 *
 * `filters` declares the filter keys and their defaults. A filter set to '' falls back to its default.
 * Pass `pageSize: null` for a screen that is not paged (the reports overview).
 */
export function useListParams({ filters: filterDefaults = {}, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState(null)
 
  const urlSearch = searchParams.get('q') ?? ''
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)
  const sort = searchParams.get('sort') ?? ''
  const filters = Object.fromEntries(Object.entries(filterDefaults).map(([key, fallback]) => [key, searchParams.get(key) || fallback]))
 
  const update = useCallback(
    (changes) =>
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, String(value)) : next.delete(key)))
          if (!('page' in changes)) next.delete('page')
          return next
        },
        { replace: true },
      ),
    [setSearchParams],
  )
 
  // Typing updates the box at once; the URL (and so the request) follows once typing pauses.
  useEffect(() => {
    if (draft === null || draft.trim() === urlSearch) return undefined
    const timer = setTimeout(() => update({ q: draft.trim() }), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [draft, urlSearch, update])
 
  const reset = useCallback(() => {
    setDraft(null)
    setSearchParams({}, { replace: true })
  }, [setSearchParams])
 
  const setFilter = useCallback((key, value) => update({ [key]: value }), [update])
  const setPage = useCallback((next) => update({ page: next > 1 ? next : null }), [update])
  const setSort = useCallback((next) => update({ sort: next ? `${next.direction === 'desc' ? '-' : ''}${next.key}` : null }), [update])
 
  const hasActiveFilters = urlSearch !== '' || Object.entries(filterDefaults).some(([key, fallback]) => filters[key] !== fallback)
 
  return {
    search: {
      value: draft !== null && draft.trim() !== urlSearch ? draft : urlSearch,
      onChange: setDraft,
    },
    filters,
    page,
    pageSize,
    sortState: parseSort(sort),
    apiParams: Object.fromEntries(
      Object.entries({ q: urlSearch, ...(pageSize === null ? {} : { page, pageSize }), sort, ...filters }).filter(([, value]) => value !== ''),
    ),
    hasActiveFilters,
    setFilter,
    setFilters: update,
    setPage,
    setSort,
    reset,
  }
}