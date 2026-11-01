import { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { formatINR } from '@/lib/format'

// The listing design (p-02) shows two rows of three products per page ("Showing 1–6 of …").
export const PAGE_SIZE = 6
export const DEFAULT_SORT = 'recommended'
export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Biggest discount' },
  { value: 'newest', label: 'Newest' },
]

const FILTER_PARAMS = ['minPrice', 'maxPrice', 'inStock', 'minRating', 'minDiscount', 'walletRewards']

function readNumber(value) {
  if (value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function readQuery(searchParams, category) {
  const sort = searchParams.get('sort')
  return {
    q: searchParams.get('q')?.trim() || undefined,
    category,
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? sort : DEFAULT_SORT,
    page: Math.max(1, Math.floor(readNumber(searchParams.get('page')) ?? 1)),
    pageSize: PAGE_SIZE,
    minPrice: readNumber(searchParams.get('minPrice')),
    maxPrice: readNumber(searchParams.get('maxPrice')),
    inStock: searchParams.get('inStock') === 'true' || undefined,
    minRating: readNumber(searchParams.get('minRating')),
    minDiscount: readNumber(searchParams.get('minDiscount')),
    walletRewards: searchParams.get('walletRewards') === 'true' || undefined,
  }
}

function priceLabel({ minPrice, maxPrice }) {
  if (minPrice !== undefined && maxPrice !== undefined) return `${formatINR(minPrice)} – ${formatINR(maxPrice)}`
  return minPrice !== undefined ? `${formatINR(minPrice)} & above` : `Up to ${formatINR(maxPrice)}`
}

// One entry per applied filter, with the URL patch that removes it. Category is not listed: it has its own navigation.
function describeFilters(query) {
  const filters = []
  if (query.inStock) filters.push({ id: 'inStock', label: 'In stock', remove: { inStock: undefined } })
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filters.push({ id: 'price', label: priceLabel(query), remove: { minPrice: undefined, maxPrice: undefined } })
  }
  if (query.minRating !== undefined) filters.push({ id: 'minRating', label: `${query.minRating}★ & above`, remove: { minRating: undefined } })
  if (query.minDiscount !== undefined) {
    filters.push({ id: 'minDiscount', label: `${query.minDiscount}% off or more`, remove: { minDiscount: undefined } })
  }
  if (query.walletRewards) filters.push({ id: 'walletRewards', label: 'Wallet rewards', remove: { walletRewards: undefined } })
  return filters
}

/**
 * The catalogue query lives in the URL (`/category/haldi?q=turmeric&sort=price_asc&inStock=true&page=2`) so every
 * view is shareable and survives a refresh. `query` is exactly what the API receives; the backend does the
 * filtering, sorting and paging. Any change other than a page change returns to page 1.
 */
export function useProductFilters(category) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(() => readQuery(searchParams, category), [searchParams, category])
  const appliedFilters = useMemo(() => describeFilters(query), [query])

  const update = useCallback(
    (patch) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous)
        Object.entries(patch).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '' || value === false) next.delete(key)
          else next.set(key, String(value))
        })
        if (!('page' in patch)) next.delete('page')
        return next
      })
    },
    [setSearchParams],
  )

  const selectCategory = useCallback(
    (slug) => {
      const next = new URLSearchParams(searchParams)
      next.delete('page')
      const search = next.toString()
      navigate({ pathname: slug ? paths.category(slug) : paths.shop, search: search ? `?${search}` : '' })
    },
    [navigate, searchParams],
  )

  const clearFilters = useCallback(() => {
    update(Object.fromEntries(FILTER_PARAMS.map((key) => [key, undefined])))
  }, [update])

  // Back to every category with no filters; the search text and sort order are kept.
  const resetAll = useCallback(() => {
    const next = new URLSearchParams(searchParams)
    ;[...FILTER_PARAMS, 'page'].forEach((key) => next.delete(key))
    const search = next.toString()
    navigate({ pathname: paths.shop, search: search ? `?${search}` : '' })
  }, [navigate, searchParams])

  return {
    query,
    appliedFilters,
    setSearch: (q) => update({ q: q.trim() }),
    setSort: (sort) => update({ sort: sort === DEFAULT_SORT ? undefined : sort }),
    setPage: (page) => update({ page: page > 1 ? page : undefined }),
    setFilters: update,
    removeFilter: (filter) => update(filter.remove),
    clearFilters,
    resetAll,
    selectCategory,
  }
}
