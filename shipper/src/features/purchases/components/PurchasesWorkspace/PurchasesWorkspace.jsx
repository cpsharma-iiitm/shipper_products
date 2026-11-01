import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import IconButton from '@/components/atoms/IconButton'
import StatusBadge from '@/components/atoms/StatusBadge'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import PageHeader from '@/components/molecules/PageHeader'
import SearchField from '@/components/molecules/SearchField'
import SelectField from '@/components/molecules/SelectField'
import ConfirmDialog from '@/components/organisms/ConfirmDialog'
import DataTable from '@/components/organisms/DataTable'
import { PURCHASE_PAGE_SIZE, usePurchaseFilters } from '@/features/purchases/hooks/usePurchaseFilters'
import { useCancelPurchase, usePurchases } from '@/features/purchases/hooks/usePurchases'
import { formatDateTime } from '@/lib/date'
import { formatINR, pluralize } from '@/lib/format'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import styles from './PurchasesWorkspace.module.scss'

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'payment_pending', label: 'Payment pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
]

const OPEN_STATUSES = ['draft', 'payment_pending']

const toSortState = (sort) => (sort ? { key: sort.replace(/^-/, ''), direction: sort.startsWith('-') ? 'desc' : 'asc' } : null)
const toSortParam = (sort) => (sort ? `${sort.direction === 'desc' ? '-' : ''}${sort.key}` : '')

/** Admin purchase list: search, status filter, sortable table, continue a draft and cancel an open purchase. */
export default function PurchasesWorkspace() {
  const { filters, update, initialSearch } = usePurchaseFilters()
  const [searchText, setSearchText] = useState(initialSearch)
  const [cancelTarget, setCancelTarget] = useState(null)
  const search = useDebouncedValue(searchText.trim(), 300)
  const { data, isPending, isError, error, refetch } = usePurchases({
    q: search,
    status: filters.status,
    sort: filters.sort || undefined,
    page: filters.page,
    pageSize: PURCHASE_PAGE_SIZE,
  })
  const cancelPurchase = useCancelPurchase()

  const clearFilters = () => {
    setSearchText('')
    update({ status: 'all' })
  }

  const confirmCancel = () => {
    cancelPurchase.mutate(cancelTarget.purchaseNumber, {
      onSuccess: () => {
        toast.success(`${cancelTarget.purchaseNumber} cancelled.`)
        setCancelTarget(null)
      },
      onError: (failure) => {
        toast.error(getErrorMessage(failure))
        setCancelTarget(null)
      },
    })
  }

  const columns = [
    { key: 'purchaseNumber', header: 'Purchase no.', cell: (row) => <strong>{row.purchaseNumber}</strong> },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      cell: (row) => (
        <>
          {row.customerName}
          <span className={styles.code}>{row.customerCode}</span>
        </>
      ),
    },
    { key: 'createdAt', header: 'Created', sortable: true, cell: (row) => formatDateTime(row.createdAt) },
    {
      key: 'items',
      header: 'Items',
      cell: (row) => `${pluralize(row.products, 'product')} · ${pluralize(row.units, 'unit')}`,
    },
    { key: 'grossAmount', header: 'Total', sortable: true, align: 'right', cell: (row) => formatINR(row.grossAmount, { decimals: 2 }) },
    { key: 'paymentLabel', header: 'Payment', cell: (row) => row.paymentLabel },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ]

  const rows = data?.items ?? []

  return (
    <div className={styles.page}>
      <PageHeader
        title="Purchases"
        description="Purchases created for customers, with their payment status."
        actions={
          <Button as={Link} to={paths.admin.newPurchase} leftIcon="plus-lg" size="sm">
            Create purchase
          </Button>
        }
      />

      <div className={styles.toolbar}>
        <SearchField
          className={styles.search}
          size="sm"
          value={searchText}
          onChange={(value) => {
            setSearchText(value)
            update({})
          }}
          placeholder="Search purchase no., customer or reference"
          aria-label="Search purchases by number, customer or reference"
        />
        <div className={styles.status}>
          <SelectField
            size="sm"
            prefixLabel="Status:"
            aria-label="Filter by status"
            options={STATUS_FILTER_OPTIONS}
            value={filters.status}
            onChange={(value) => update({ status: value })}
          />
        </div>
      </div>

      <Card padding="md" radius="md" className={styles.card} aria-label="Purchases">
        {isError && !data ? (
          <ErrorState title="Purchases could not be loaded" message={getErrorMessage(error)} onRetry={refetch} compact />
        ) : (
          <DataTable
            className={styles.table}
            caption="Purchases"
            columns={columns}
            rows={rows}
            loading={isPending}
            loadingRows={PURCHASE_PAGE_SIZE}
            getRowId={(row) => row.purchaseNumber}
            sort={toSortState(filters.sort)}
            onSortChange={(next) => update({ sort: toSortParam(next) })}
            minWidth="860px"
            actionsHeader={<span className="visually-hidden">Actions</span>}
            rowActions={(row) =>
              OPEN_STATUSES.includes(row.status) ? (
                <div className={styles.actions}>
                  {row.status === 'draft' && (
                    <Button as={Link} to={`${paths.admin.newPurchase}?draft=${row.purchaseNumber}`} variant="secondary" size="sm">
                      Continue
                    </Button>
                  )}
                  <IconButton icon="x-circle" tone="danger" size="sm" label={`Cancel ${row.purchaseNumber}`} onClick={() => setCancelTarget(row)} />
                </div>
              ) : null
            }
            emptyState={
              <EmptyState
                compact
                icon="receipt"
                title="No purchases match these filters"
                description="Try a different search or clear the filters."
                action={
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            }
            pagination={{
              page: filters.page,
              pageSize: PURCHASE_PAGE_SIZE,
              totalItems: data?.totalItems ?? 0,
              onPageChange: (page) => update({ page }),
              itemLabel: 'purchases',
            }}
          />
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
        loading={cancelPurchase.isPending}
        tone="danger"
        title={`Cancel ${cancelTarget?.purchaseNumber ?? 'purchase'}?`}
        message={
          <p>
            {cancelTarget && `${cancelTarget.purchaseNumber} for ${cancelTarget.customerName} will be closed and any payment request withdrawn. This cannot be undone.`}
          </p>
        }
        confirmLabel="Cancel purchase"
        cancelLabel="Keep purchase"
      />
    </div>
  )
}
