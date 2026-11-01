import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { paths } from '@/app/router/paths'
import { getErrorMessage } from '@/app/services'
import Button from '@/components/atoms/Button'
import PageHeader from '@/components/molecules/PageHeader'
import ConfirmDialog from '@/components/organisms/ConfirmDialog'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDisclosure } from '@/hooks/useDisclosure'
import BulkUpdateModal from '@/features/products/components/BulkUpdateModal'
import ImportProductsModal from '@/features/products/components/ImportProductsModal'
import ProductFilterCards from '@/features/products/components/ProductFilterCards'
import ProductFormModal from '@/features/products/components/ProductFormModal'
import ProductsTableCard from '@/features/products/components/ProductsTableCard'
import ProductToolbar from '@/features/products/components/ProductToolbar'
import { PRODUCT_PAGE_SIZE, useProductFilters } from '@/features/products/hooks/useProductFilters'
import { useDeleteProduct, useExportProducts, useProductOptions, useProducts } from '@/features/products/hooks/useProducts'
import { EXPORT_COLUMNS, toExportRow } from '@/features/products/utils/productSheet'
import { exportToExcel } from '@/lib/excel'
import { formatDate, formatDateTime } from '@/lib/date'
import styles from './ProductsWorkspace.module.scss'

/** Admin product management: filters, table, add/edit, delete, bulk update, import and export. */
export default function ProductsWorkspace() {
  const { filters, update, initialSearch } = useProductFilters()
  const [searchText, setSearchText] = useState(initialSearch)
  const [selectedCodes, setSelectedCodes] = useState([])
  const [formTarget, setFormTarget] = useState(null) // null (closed) | 'new' | a product
  const [deleteTarget, setDeleteTarget] = useState(null)
  const bulkModal = useDisclosure()
  const importModal = useDisclosure()

  const search = useDebouncedValue(searchText.trim(), 300)
  const listFilters = { q: search, category: filters.category, stock: filters.stock, status: filters.status }
  const query = useProducts({ ...listFilters, page: filters.page, pageSize: PRODUCT_PAGE_SIZE, sort: filters.sort })
  const { data: options } = useProductOptions()
  const deleteProduct = useDeleteProduct()
  const exportProducts = useExportProducts()

  const changeFilters = (changes) => {
    setSelectedCodes([])
    update(changes)
  }

  const changeSearch = (value) => {
    setSelectedCodes([])
    setSearchText(value)
    update({})
  }

  const clearFilters = () => {
    setSearchText('')
    changeFilters({ category: 'all', stock: 'all', status: 'all' })
  }

  const handleExport = () => {
    exportProducts.mutate(
      { ...listFilters, sort: filters.sort },
      {
        onSuccess: async ({ generatedAt, items }) => {
          try {
            await exportToExcel({
              fileName: `shipper-products-${formatDate(generatedAt).replaceAll(' ', '-')}`,
              sheetName: 'Products',
              title: `Shipper.com products · ${formatDateTime(generatedAt)}`,
              columns: EXPORT_COLUMNS,
              rows: items.map(toExportRow),
            })
            toast.success(`Exported ${items.length} products to Excel.`)
          } catch {
            toast.error('The Excel file could not be created. Please try again.')
          }
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )
  }

  const confirmDelete = () => {
    deleteProduct.mutate(deleteTarget.code, {
      onSuccess: () => {
        toast.success(`${deleteTarget.name} deleted.`)
        setSelectedCodes((codes) => codes.filter((code) => code !== deleteTarget.code))
        setDeleteTarget(null)
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  const stockInfo = query.data?.stock

  return (
    <div className={styles.page}>
      <PageHeader
        title="Products"
        description="Manage product information, pricing, tax and inventory."
        actions={
          <Button leftIcon="plus-lg" size="sm" onClick={() => setFormTarget('new')}>
            Add Product
          </Button>
        }
      />

      <ProductFilterCards counts={query.data?.counts} filters={filters} onChange={changeFilters} />

      <ProductToolbar
        searchText={searchText}
        onSearchChange={changeSearch}
        filters={filters}
        categories={options?.categories}
        onFilterChange={changeFilters}
        onExport={handleExport}
        exporting={exportProducts.isPending}
      />

      <ProductsTableCard
        query={query}
        page={filters.page}
        sort={filters.sort}
        selectedCodes={selectedCodes}
        onSelectionChange={setSelectedCodes}
        onSortChange={(sort) => update({ sort })}
        onPageChange={(page) => update({ page })}
        onEdit={setFormTarget}
        onDelete={setDeleteTarget}
        onBulkUpdate={bulkModal.open}
        onImport={importModal.open}
        onClearFilters={clearFilters}
      />

      <footer className={styles.footer}>
        <p>{stockInfo ? `Stock updated ${formatDateTime(stockInfo.updatedAt)} · ${stockInfo.warehouse}` : ' '}</p>
        <Link to={paths.admin.restock} className={styles.link}>
          View inventory movement <span aria-hidden="true">→</span>
        </Link>
      </footer>

      {formTarget && (
        <ProductFormModal
          key={formTarget === 'new' ? 'new' : formTarget.code}
          product={formTarget === 'new' ? null : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}

      {bulkModal.isOpen && (
        <BulkUpdateModal
          selectedCodes={selectedCodes}
          matchingCount={query.data?.totalItems ?? 0}
          filters={listFilters}
          onClose={bulkModal.close}
          onUpdated={() => setSelectedCodes([])}
        />
      )}

      {importModal.isOpen && <ImportProductsModal onClose={importModal.close} />}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteProduct.isPending}
        tone="danger"
        title={`Delete ${deleteTarget?.name ?? 'product'}?`}
        message={
          <p>
            {deleteTarget?.code} will be removed from the catalogue and hidden from the storefront. Past orders keep their record of it.
          </p>
        }
        confirmLabel="Delete product"
      />
    </div>
  )
}
