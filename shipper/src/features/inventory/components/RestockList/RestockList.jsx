import { useState } from 'react'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import BulkActionBar from '@/components/molecules/BulkActionBar'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import StatCard from '@/components/molecules/StatCard'
import { ListToolbar, StatGrid, useListParams } from '@/features/admin-lists'
import RestockTable from '@/features/inventory/components/RestockTable'
import { RESTOCK_CATEGORY_OPTIONS, RESTOCK_LEVEL_OPTIONS } from '@/features/inventory/constants/restockOptions'
import { useRestockItems } from '@/features/inventory/hooks/useRestock'
import { useRequestRestock } from '@/features/inventory/hooks/useRequestRestock'
import { parseQuantity } from '@/features/inventory/lib/quantity'
import { formatNumber } from '@/lib/format'
import styles from './RestockList.module.scss'

// The cards are shortcuts to the same "Status" filter as the select below them.
const SUMMARY_CARDS = [
  { level: '', label: 'Needs restock', count: 'all' },
  { level: 'low', label: 'Low stock', count: 'low' },
  { level: 'out', label: 'Out of stock', count: 'out' },
]

/** The admin Order restock screen: low and out-of-stock products with a suggested quantity to order. */
export default function RestockList() {
  const list = useListParams({ pageSize: 12, filters: { level: '', category: '' } })
  const { data, isPending, isError, error, refetch } = useRestockItems(list.apiParams)
  const requestRestock = useRequestRestock()

  // Typed quantities by product code; a row without an entry shows the backend's suggestion.
  const [quantities, setQuantities] = useState({})
  // Picked rows (code → item) belong to the filters they were picked under, so changing a filter starts afresh.
  const [selection, setSelection] = useState({ key: '', picked: {} })
  const filterKey = JSON.stringify({ ...list.apiParams, page: undefined, sort: undefined })
  const picked = selection.key === filterKey ? selection.picked : {}
  const pickedItems = Object.values(picked)

  const quantityOf = (item) => quantities[item.productCode] ?? String(item.suggestedQuantity)
  const setQuantity = (productCode, value) => setQuantities((current) => ({ ...current, [productCode]: value }))

  const changeSelection = (ids) =>
    setSelection({
      key: filterKey,
      picked: Object.fromEntries(ids.map((id) => [id, picked[id] ?? data.items.find((item) => item.productCode === id)])),
    })

  const restockLines = (items) => items.map((item) => ({ productCode: item.productCode, quantity: parseQuantity(quantityOf(item)) }))
  const bulkInvalid = pickedItems.some((item) => parseQuantity(quantityOf(item)) === null)

  const toolbarFilters = [
    {
      key: 'category',
      label: 'Category',
      prefix: 'Category:',
      options: RESTOCK_CATEGORY_OPTIONS,
      value: list.filters.category,
      onChange: (value) => list.setFilter('category', value),
    },
    {
      key: 'level',
      label: 'Stock status',
      prefix: 'Status:',
      options: RESTOCK_LEVEL_OPTIONS,
      value: list.filters.level,
      onChange: (value) => list.setFilter('level', value),
    },
  ]

  return (
    <div className={styles.page}>
      <PageHeader title="Order restock" description="Products at or below their reorder level, with the quantity we suggest restocking." />

      <StatGrid columns={3}>
        {SUMMARY_CARDS.map((card) => (
          <StatCard
            key={card.label}
            layout="inline"
            label={card.label}
            value={data ? formatNumber(data.counts[card.count] ?? 0) : '—'}
            selected={list.filters.level === card.level}
            onClick={() => list.setFilter('level', list.filters.level === card.level ? '' : card.level)}
          />
        ))}
      </StatGrid>

      <ListToolbar
        search={{ ...list.search, label: 'Search products', placeholder: 'Search product name or code' }}
        filters={toolbarFilters}
        hasActiveFilters={list.hasActiveFilters}
        onClear={list.reset}
      />

      <BulkActionBar selectedCount={pickedItems.length} itemLabel="product" onClear={() => setSelection({ key: filterKey, picked: {} })}>
        <Button
          size="sm"
          leftIcon="box-arrow-in-down"
          disabled={bulkInvalid}
          loading={requestRestock.isPending}
          onClick={() => requestRestock.mutate(restockLines(pickedItems), { onSuccess: () => setSelection({ key: filterKey, picked: {} }) })}
        >
          Request restock
        </Button>
      </BulkActionBar>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      ) : (
        <RestockTable
          rows={data?.items ?? []}
          loading={isPending}
          sort={list.sortState}
          onSortChange={list.setSort}
          selectedIds={Object.keys(picked)}
          onSelectionChange={changeSelection}
          quantityOf={quantityOf}
          onQuantityChange={setQuantity}
          onRequestRestock={(item) => requestRestock.mutate(restockLines([item]))}
          requesting={requestRestock.isPending}
          emptyState={
            <EmptyState
              compact
              icon="box-seam"
              title={list.hasActiveFilters ? 'No products match these filters' : 'Everything is well stocked'}
              description={list.hasActiveFilters ? 'Try a different search, or clear the filters.' : 'No product is at or below its reorder level right now.'}
              action={
                list.hasActiveFilters && (
                  <Button variant="secondary" size="sm" onClick={list.reset}>
                    Clear filters
                  </Button>
                )
              }
            />
          }
          pagination={data && { page: data.page, pageSize: data.pageSize, totalItems: data.totalItems, onPageChange: list.setPage, itemLabel: 'products' }}
        />
      )}
    </div>
  )
}
