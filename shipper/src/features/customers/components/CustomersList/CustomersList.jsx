import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import StatCard from '@/components/molecules/StatCard'
import { EXPORT_PAGE_SIZE, fetchAllPages, ListToolbar, StatGrid, useExcelExport, useListParams } from '@/features/admin-lists'
import CustomersTable from '@/features/customers/components/CustomersTable'
import { CUSTOMER_STATUS_OPTIONS, WALLET_OPTIONS } from '@/features/customers/constants/customerOptions'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { customersSheet, customersSheetRows } from '@/features/customers/lib/customersSheet'
import { listCustomers } from '@/features/customers/services/customerService'
import { formatNumber } from '@/lib/format'
import styles from './CustomersList.module.scss'

// The cards are shortcuts to the same Status / Wallet filters as the selects below them.
const SUMMARY_CARDS = [
  { label: 'All customers', count: 'all', filters: { status: '', wallet: '' } },
  { label: 'Active', count: 'active', filters: { status: 'active', wallet: '' } },
  { label: 'Inactive', count: 'inactive', filters: { status: 'inactive', wallet: '' } },
  { label: 'With wallet balance', count: 'withWallet', filters: { status: '', wallet: 'with' } },
]

/** Cities come from the backend (`facets.cities`); the selected one stays in the list while the data loads. */
function cityOptions(cities = [], selected) {
  const names = selected && !cities.includes(selected) ? [selected, ...cities] : cities
  return [{ value: '', label: 'All' }, ...names.map((city) => ({ value: city, label: city }))]
}

/** The admin Customers screen: search, filter, sort, page and export every customer. */
export default function CustomersList() {
  const navigate = useNavigate()
  const list = useListParams({ pageSize: 10, filters: { status: '', city: '', wallet: '' } })
  const { data, isPending, isError, error, refetch } = useCustomers(list.apiParams)
  const exporter = useExcelExport()

  const exportCustomers = () =>
    exporter.mutate({
      ...customersSheet,
      getRows: async () => customersSheetRows(await fetchAllPages((page) => listCustomers({ ...list.apiParams, page, pageSize: EXPORT_PAGE_SIZE }))),
    })

  const toolbarFilters = [
    {
      key: 'status',
      label: 'Customer status',
      prefix: 'Status:',
      options: CUSTOMER_STATUS_OPTIONS,
      value: list.filters.status,
      onChange: (value) => list.setFilter('status', value),
    },
    {
      key: 'city',
      label: 'City',
      prefix: 'City:',
      searchable: true,
      options: cityOptions(data?.facets.cities, list.filters.city),
      value: list.filters.city,
      onChange: (value) => list.setFilter('city', value),
    },
    {
      key: 'wallet',
      label: 'Wallet balance',
      prefix: 'Wallet:',
      options: WALLET_OPTIONS,
      value: list.filters.wallet,
      onChange: (value) => list.setFilter('wallet', value),
    },
  ]

  return (
    <div className={styles.page}>
      <PageHeader title="Customers" description="Look up a customer, their orders, wallet and saved addresses." />

      <StatGrid>
        {SUMMARY_CARDS.map((card) => {
          const selected = Object.entries(card.filters).every(([key, value]) => list.filters[key] === value)
          return (
            <StatCard
              key={card.label}
              layout="inline"
              label={card.label}
              value={data ? formatNumber(data.counts[card.count] ?? 0) : '—'}
              selected={selected}
              onClick={() => list.setFilters(selected ? { status: '', wallet: '' } : card.filters)}
            />
          )
        })}
      </StatGrid>

      <ListToolbar
        search={{ ...list.search, label: 'Search customers', placeholder: 'Search name, code, mobile or email' }}
        filters={toolbarFilters}
        hasActiveFilters={list.hasActiveFilters}
        onClear={list.reset}
      >
        <Button variant="secondary" size="sm" leftIcon="download" disabled={!data} loading={exporter.isPending} onClick={exportCustomers}>
          Export
        </Button>
      </ListToolbar>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      ) : (
        <CustomersTable
          rows={data?.items ?? []}
          loading={isPending}
          sort={list.sortState}
          onSortChange={list.setSort}
          onOpen={(code) => navigate(paths.admin.customer(code))}
          emptyState={
            <EmptyState
              compact
              icon="people"
              title="No customers match these filters"
              description="Try a different search, or clear the filters to see every customer."
              action={
                <Button variant="secondary" size="sm" onClick={list.reset}>
                  Clear filters
                </Button>
              }
            />
          }
          pagination={
            data && { page: data.page, pageSize: data.pageSize, totalItems: data.totalItems, onPageChange: list.setPage, itemLabel: 'customers' }
          }
        />
      )}
    </div>
  )
}
