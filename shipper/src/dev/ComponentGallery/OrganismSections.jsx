import { useMemo, useState } from 'react'
import {
    Button,
    ConfirmDialog,
    DataTable,
    Drawer,
    FormField,
    IconButton,
    Input,
    Modal,
    SelectField,
    StatusBadge,
    BulkActionBar,
} from '@/components'
import { formatINR } from '@/lib/format'
import { Section, Specimen } from './Specimen'
import styles from './ComponentGallery.module.scss'

// DEV FIXTURE — placeholder rows for the table demo, not real catalogue data.
const SAMPLE_PRODUCTS = [
    { id: 'P-1001', code: 'HAL-500', name: 'Haldi Powder 500g', category: 'Haldi', price: 120, stock: 240, status: 'active' },
    { id: 'P-1002', code: 'SHA-250', name: 'Herbal Shampoo 250ml', category: 'Shampoo', price: 245, stock: 18, status: 'low_stock' },
    { id: 'P-1003', code: 'COS-030', name: 'Matte Lip Colour', category: 'Cosmetics', price: 399, stock: 64, status: 'active' },
    { id: 'P-1004', code: 'GRO-001', name: 'Cold-pressed Mustard Oil 1L', category: 'Grocery', price: 210, stock: 0, status: 'out_of_stock' },
    { id: 'P-1005', code: 'PCR-120', name: 'Aloe Face Wash 120ml', category: 'Personal Care', price: 175, stock: 91, status: 'inactive' },
]

const PRODUCT_COLUMNS = [
    {
        key: 'name',
        header: 'Product',
        sortable: true,
        cell: (row) => (
            <>
                <strong>{row.name}</strong>
                <div className="text-secondary small">{row.code}</div>
            </>
        ),
    },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'price', header: 'Selling price', align: 'right', sortable: true, cell: (row) => formatINR(row.price) },
    { key: 'stock', header: 'Stock', align: 'right' },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
]

const CATEGORY_OPTIONS = [
    { value: 'haldi', label: 'Haldi' },
    { value: 'shampoo', label: 'Shampoo' },
    { value: 'cosmetics', label: 'Cosmetics' },
]

function TableDemo() {
    const [selectedIds, setSelectedIds] = useState(['P-1002'])
    const [sort, setSort] = useState({ key: 'name', direction: 'asc' })
    const [page, setPage] = useState(1)
    const [mode, setMode] = useState('data')

    // Demo only: the real table is sorted by the backend; this keeps the specimen interactive.
    const rows = useMemo(() => {
        if (mode === 'empty') return []
        if (!sort) return SAMPLE_PRODUCTS
        const factor = sort.direction === 'asc' ? 1 : -1
        return [...SAMPLE_PRODUCTS].sort((a, b) => (a[sort.key] > b[sort.key] ? factor : -factor))
    }, [mode, sort])

    return (
        <div className={styles.stack}>
            <div className={styles.row}>
                {['data', 'loading', 'empty'].map((option) => (
                    <Button key={option} size="sm" variant={mode === option ? 'primary' : 'secondary'} onClick={() => setMode(option)}>
                        {option}
                    </Button>
                ))}
            </div>
            <BulkActionBar selectedCount={selectedIds.length} itemLabel="product" onClear={() => setSelectedIds([])}>
                <Button size="sm" variant="secondary">
                    Mark inactive
                </Button>
            </BulkActionBar>
            <DataTable
                caption="Sample products"
                columns={PRODUCT_COLUMNS}
                rows={rows}
                loading={mode === 'loading'}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                getRowLabel={(row) => row.name}
                sort={sort}
                onSortChange={setSort}
                rowActions={(row) => (
                    <>
                        <IconButton icon="eye" label={`View ${row.name}`} size="sm" />
                        <IconButton icon="pencil" label={`Edit ${row.name}`} size="sm" />
                    </>
                )}
                pagination={{ page, pageSize: 5, totalItems: 126, onPageChange: setPage, itemLabel: 'products' }}
            />
        </div>
    )
}

function OverlayDemo() {
    const [modalOpen, setModalOpen] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [category, setCategory] = useState('haldi')

    return (
        <div className={styles.row}>
            <Button onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                Open drawer
            </Button>
            <Button variant="secondary" onClick={() => setSheetOpen(true)}>
                Open bottom sheet
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Confirm dialog
            </Button>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Add product"
                description="The select menu below must render above this dialog."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setConfirmOpen(true)}>Save product</Button>
                    </>
                }
            >
                <div className="row g-3">
                    <div className="col-md-6">
                        <FormField label="Product name" required>
                            {(control) => <Input {...control} placeholder="Haldi Powder 500g" />}
                        </FormField>
                    </div>
                    <div className="col-md-6">
                        <FormField label="Category" required>
                            {(control) => <SelectField id={control.id} options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />}
                        </FormField>
                    </div>
                    <div className="col-12" style={{ minHeight: '28rem' }} />
                </div>
            </Modal>

            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Edit address"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setDrawerOpen(false)}>Save address</Button>
                    </>
                }
            >
                <FormField label="Full name" required>
                    {(control) => <Input {...control} defaultValue="Pawan Yadav" />}
                </FormField>
            </Drawer>

            <Drawer open={sheetOpen} onClose={() => setSheetOpen(false)} placement="bottom" title="Filters">
                <p className="mb-0">Bottom sheet content.</p>
            </Drawer>

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => setConfirmOpen(false)}
                tone="danger"
                title="Remove item?"
                message="This item will be removed from your cart."
                confirmLabel="Remove"
            />
        </div>
    )
}

export default function OrganismSections() {
    return (
        <>
            <Section id="overlays" title="Modal, drawer and confirm dialog" description="Esc closes the top-most overlay; Tab stays inside it; focus returns to the trigger.">
                <Specimen label="Triggers" wide>
                    <OverlayDemo />
                </Specimen>
            </Section>
            <Section id="table" title="DataTable" description="Selection, sorting, row actions, sticky header, pagination, loading and empty states.">
                <Specimen label="Products" wide>
                    <TableDemo />
                </Specimen>
            </Section>
        </>
    )
}