import { useRef } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { CATEGORIES } from '@/app/config/categories'
import { getErrorMessage } from '@/app/services'
import { paths } from '@/app/router/paths'
import Button from '@/components/atoms/Button'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { Pagination } from '@/components/molecules/Pagination'
import ActiveFilters from '@/features/catalog/components/ActiveFilters'
import CategoryChips from '@/features/catalog/components/CategoryChips'
import FilterPanel from '@/features/catalog/components/FilterPanel'
import FilterSheet from '@/features/catalog/components/FilterSheet'
import ProductGrid from '@/features/catalog/components/ProductGrid'
import ResultsSummary from '@/features/catalog/components/ResultsSummary'
import ShopIntro from '@/features/catalog/components/ShopIntro'
import ShopSearch from '@/features/catalog/components/ShopSearch'
import SortSelect from '@/features/catalog/components/SortSelect'
import { useCategories, useProducts } from '@/features/catalog/hooks/useCatalog'
import { useProductFilters } from '@/features/catalog/hooks/useProductFilters'
import { useSaveProduct } from '@/features/catalog/hooks/useSaveProduct'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import styles from './ShopCatalog.module.scss'

/**
 * Catalogue browsing: filters, sort, search and paging, all held in the URL and answered by the API.
 * Desktop shows the filter panel beside the grid; below 1024px it opens as a bottom sheet.
 */
export default function ShopCatalog({ categorySlug }) {
  const category = CATEGORIES.find((entry) => entry.slug === categorySlug)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const sheet = useDisclosure()
  const resultsRef = useRef(null)
  const filters = useProductFilters(category?.slug)
  const { query, appliedFilters } = filters
  const products = useProducts(query, { keepPrevious: true, enabled: !categorySlug || Boolean(category) })
  const { data: categories } = useCategories()
  const save = useSaveProduct()

  if (categorySlug && !category) {
    return (
      <div className="sh-container py-5">
        <EmptyState
          icon="search"
          title="We couldn’t find that category"
          description="It may have moved. Browse everything we have instead."
          action={
            <Button as={Link} to={paths.shop}>
              Shop all products
            </Button>
          }
        />
      </div>
    )
  }

  const { data } = products
  const goToPage = (page) => {
    filters.setPage(page)
    resultsRef.current?.scrollIntoView({ block: 'start' })
  }

  const panel = (
    <FilterPanel query={query} facets={data?.facets} onChange={filters.setFilters} onCategoryChange={filters.selectCategory} />
  )
  const sort = <SortSelect value={query.sort} onChange={filters.setSort} size={isDesktop ? 'lg' : 'sm'} />

  let results
  if (products.isError) {
    results = <ErrorState message={getErrorMessage(products.error)} onRetry={products.refetch} />
  } else if (products.isPending) {
    results = <ProductGrid loading skeletonCount={6} />
  } else if (data.items.length === 0) {
    results = (
      <EmptyState
        icon="search"
        title={query.q ? `No results for “${query.q}”` : 'No products match your filters'}
        description="Try removing a filter or searching for something else."
        action={
          (appliedFilters.length > 0 || query.q) && (
            <Button variant="secondary" onClick={appliedFilters.length > 0 ? filters.clearFilters : () => filters.setSearch('')}>
              {appliedFilters.length > 0 ? 'Clear filters' : 'Clear search'}
            </Button>
          )
        }
      />
    )
  } else {
    results = (
      <ProductGrid
        label="Products"
        products={data.items}
        isSaved={save.isSaved}
        onToggleSaved={save.onToggleSaved}
      />
    )
  }

  return (
    <div className={clsx('sh-container', styles.page)}>
      <ShopIntro
        category={category}
        categoryDescription={categories?.find((entry) => entry.slug === category?.slug)?.description}
        searchText={query.q}
        totalItems={data?.totalItems}
      />

      {!isDesktop && <CategoryChips activeSlug={category?.slug} className={styles.chips} />}

      <div className={styles.toolbar}>
        {isDesktop ? (
          <>
            <ShopSearch className={styles.search} value={query.q} onSearch={filters.setSearch} />
            <div className={styles.sort}>{sort}</div>
          </>
        ) : (
          <>
            <Button variant="secondary" size="lg" leftIcon="sliders" onClick={sheet.open} aria-haspopup="dialog">
              Filters
              {appliedFilters.length > 0 && <span className={styles.count}>{appliedFilters.length}</span>}
            </Button>
            <div className={styles.sort}>{sort}</div>
          </>
        )}
      </div>

      {!isDesktop && (
        <ActiveFilters className={styles.chipsRow} filters={appliedFilters} onRemove={filters.removeFilter} onClear={filters.clearFilters} />
      )}

      <div className={styles.body}>
        {isDesktop && (
          <aside className={styles.sidebar} aria-label="Filters">
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Filters</h2>
              <button type="button" className={styles.reset} onClick={filters.resetAll}>
                Reset all
              </button>
            </div>
            {panel}
          </aside>
        )}

        <section ref={resultsRef} className={styles.results} aria-label="Search results">
          <div className={styles.resultsBar}>
            {data && <ResultsSummary page={data.page} pageSize={data.pageSize} totalItems={data.totalItems} />}
            {isDesktop && <ActiveFilters filters={appliedFilters} onRemove={filters.removeFilter} />}
          </div>

          <div className={clsx(products.isPlaceholderData && styles.refreshing)} aria-busy={products.isFetching || undefined}>
            {results}
          </div>

          {data && data.pageCount > 1 && (
            <div className={styles.footer}>
              {isDesktop && <ResultsSummary page={data.page} pageSize={data.pageSize} totalItems={data.totalItems} />}
              <Pagination page={data.page} pageCount={data.pageCount} onPageChange={goToPage} />
            </div>
          )}
        </section>
      </div>

      {!isDesktop && (
        <FilterSheet
          open={sheet.isOpen}
          onClose={sheet.close}
          resultCount={data?.totalItems}
          canClear={appliedFilters.length > 0 || Boolean(category)}
          onClear={filters.resetAll}
        >
          {panel}
        </FilterSheet>
      )}
    </div>
  )
}
