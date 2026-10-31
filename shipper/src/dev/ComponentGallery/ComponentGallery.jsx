import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import {
    Alert,
    Avatar,
    Badge,
    Breadcrumbs,
    BulkActionBar,
    Button,
    Card,
    Checkbox,
    EmptyState,
    ErrorState,
    FilterChip,
    FormField,
    IconButton,
    Input,
    PaginationBar,
    PasswordInput,
    PriceDisplay,
    QuantityStepper,
    Radio,
    RatingStars,
    SearchField,
    Select,
    SelectField,
    Skeleton,
    Spinner,
    StatCard,
    StatusBadge,
    Stepper,
    SummaryRows,
    TabPanel,
    Tabs,
    Timeline,
} from '@/components'
import { STATUS_META } from '@/app/config/statuses'
import OrganismSections from './OrganismSections'
import { Section, Specimen } from './Specimen'
import styles from './ComponentGallery.module.scss'

// DEV ONLY. A living reference of the shared components with sample data. Everything shown here
// (names, prices, statuses) is a placeholder, not a real product, order or integration.

const COLOR_TOKENS = [
    ['navy', 'Announcement bar, footer, headings'],
    ['ink', 'Body text'],
    ['muted', 'Secondary text'],
    ['primary', 'Actions, links, active'],
    ['primary-hover', 'Hover (derived)'],
    ['primary-tint', 'Selected, info'],
    ['hero-tint', 'Storefront hero'],
    ['sand', 'Promo cards'],
    ['surface', 'Admin background'],
    ['border', 'Hairlines'],
    ['success', 'Success text'],
    ['success-tint', 'Success background'],
    ['warning', 'Warning text'],
    ['warning-tint', 'Warning background'],
    ['danger', 'Danger text'],
    ['danger-tint', 'Danger background'],
]

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'haldi', label: 'Haldi' },
    { value: 'shampoo', label: 'Shampoo' },
    { value: 'cosmetics', label: 'Cosmetics' },
    { value: 'grocery', label: 'Grocery' },
    { value: 'personal-care', label: 'Personal Care' },
]

const TAB_ITEMS = [
    { key: 'all', label: 'All products', count: 126 },
    { key: 'active', label: 'Active', count: 98 },
    { key: 'inactive', label: 'Inactive', count: 28 },
]

const STORE_TABS = [
    { key: 'new', label: 'New orders', count: 12 },
    { key: 'pick', label: 'To pick', count: 8 },
    { key: 'pack', label: 'To pack', count: 5 },
    { key: 'dispatch', label: 'Ready to dispatch', count: 3 },
]

const CHECKOUT_STEPS = [
    { key: 'address', label: 'Address' },
    { key: 'payment', label: 'Payment' },
    { key: 'review', label: 'Review' },
]

const TIMELINE_ITEMS = [
    { key: 'placed', title: 'Order placed', timestamp: '28 Oct 2026, 10:12 am', status: 'done' },
    { key: 'packed', title: 'Packed', description: 'Your items are packed.', timestamp: '28 Oct 2026, 04:40 pm', status: 'done' },
    { key: 'dispatched', title: 'Dispatched', status: 'current', description: 'Handed over to the carrier.' },
    { key: 'delivered', title: 'Delivered', status: 'upcoming' },
]

const SUMMARY_ROWS = [
    { label: 'Subtotal', value: '₹1,000.00' },
    { label: 'Discount', value: '– ₹100.00', tone: 'success' },
    { label: 'GST', value: '₹45.00' },
    { label: 'Shipping', value: '₹40.00' },
    { label: 'Total', value: '₹985.00', emphasis: true },
]

function AtomSections() {
    return (
        <>
            <Section id="tokens" title="Colour tokens" description="Sampled from the Figma export; published as --sh-color-* variables.">
                <Specimen label="Palette" wide>
                    <div className={styles.swatches}>
                        {COLOR_TOKENS.map(([name, usage]) => (
                            <div key={name} className={styles.swatch}>
                                <span style={{ background: `var(--sh-color-${name})` }} />
                                <p>
                                    {name}
                                    <small>{usage}</small>
                                </p>
                            </div>
                        ))}
                    </div>
                </Specimen>
            </Section>

            <Section id="buttons" title="Buttons">
                <Specimen label="Variants">
                    <div className={styles.row}>
                        <Button>Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="danger">Danger</Button>
                        <Button variant="link">Link</Button>
                    </div>
                </Specimen>
                <Specimen label="Sizes">
                    <div className={styles.row}>
                        <Button size="sm">Small 34</Button>
                        <Button size="md">Medium 40</Button>
                        <Button size="lg">Large 44</Button>
                    </div>
                </Specimen>
                <Specimen label="States and icons">
                    <div className={styles.row}>
                        <Button leftIcon="cart3">Add to Cart</Button>
                        <Button rightIcon="arrow-right">Buy Now</Button>
                        <Button loading>Saving</Button>
                        <Button disabled>Disabled</Button>
                    </div>
                </Specimen>
                <Specimen label="Icon buttons">
                    <div className={styles.row}>
                        <IconButton icon="pencil" label="Edit" />
                        <IconButton icon="eye" label="View" tone="primary" />
                        <IconButton icon="trash" label="Delete" tone="danger" />
                        <IconButton icon="three-dots" label="More actions" size="lg" />
                    </div>
                </Specimen>
            </Section>

            <Section id="badges" title="Badges and status">
                <Specimen label="Tones">
                    <div className={styles.row}>
                        <Badge>Neutral</Badge>
                        <Badge tone="info">Info</Badge>
                        <Badge tone="success">Success</Badge>
                        <Badge tone="warning">Warning</Badge>
                        <Badge tone="danger">Danger</Badge>
                        <Badge tone="info" shape="pill" size="sm">
                            Pill
                        </Badge>
                    </div>
                </Specimen>
                <Specimen label="Status vocabulary" wide>
                    <div className={styles.row}>
                        {Object.keys(STATUS_META).map((status) => (
                            <StatusBadge key={status} status={status} />
                        ))}
                    </div>
                </Specimen>
            </Section>

            <Section id="forms" title="Form controls">
                <Specimen label="FormField + Input">
                    <div className={styles.stack}>
                        <FormField label="Mobile number" required hint="We'll send an OTP to this number.">
                            {(control) => <Input {...control} placeholder="10-digit mobile number" />}
                        </FormField>
                        <FormField label="Email" error="Enter a valid email address.">
                            {(control) => <Input {...control} defaultValue="shivam@" />}
                        </FormField>
                        <FormField label="PIN code" success="Delivery available">
                            {(control) => <Input {...control} defaultValue="400001" />}
                        </FormField>
                        <FormField label="Disabled">{(control) => <Input {...control} disabled defaultValue="Locked" />}</FormField>
                    </div>
                </Specimen>
                <Specimen label="Password, search, selects">
                    <div className={styles.stack}>
                        <FormField label="Password" required>
                            {(control) => <PasswordInput {...control} placeholder="Enter password" />}
                        </FormField>
                        <SearchGalleryDemo />
                        <FormField label="State (native select)">
                            {(control) => (
                                <Select {...control} defaultValue="">
                                    <option value="" disabled>
                                        Select a state
                                    </option>
                                    <option>Maharashtra</option>
                                    <option>Karnataka</option>
                                </Select>
                            )}
                        </FormField>
                        <SelectGalleryDemo />
                    </div>
                </Specimen>
                <Specimen label="Checkbox and radio">
                    <div className={styles.stack}>
                        <Checkbox label="Save this address" defaultChecked />
                        <Checkbox label="Indeterminate" indeterminate />
                        <Checkbox label="Unchecked" hint="(optional)" />
                        <Radio name="pay" label="UPI" defaultChecked />
                        <Radio name="pay" label="Card" />
                    </div>
                </Specimen>
            </Section>

            <Section id="commerce" title="Commerce">
                <Specimen label="PriceDisplay">
                    <div className={styles.stack}>
                        <PriceDisplay sellingPrice={120} mrp={150} discountPercent={20} />
                        <PriceDisplay sellingPrice={1499} mrp={1999} discountPercent={25} size="lg" mrpLabel="MRP" uppercaseDiscount />
                        <PriceDisplay sellingPrice={85} />
                    </div>
                </Specimen>
                <Specimen label="QuantityStepper">
                    <QuantityStepperDemo />
                </Specimen>
                <Specimen label="RatingStars">
                    <div className={styles.stack}>
                        <RatingStars value={4.5} count={1280} showValue />
                        <RatingStars value={3} tone="warning" size="sm" />
                    </div>
                </Specimen>
                <Specimen label="SummaryRows">
                    <SummaryRows rows={SUMMARY_ROWS} />
                </Specimen>
            </Section>

            <Section id="navigation" title="Navigation and progress">
                <MemoryRouter>
                    <Specimen label="Breadcrumbs">
                        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Haldi', to: '/haldi' }, { label: 'Haldi Powder 500g' }]} />
                    </Specimen>
                </MemoryRouter>
                <Specimen label="Pagination" wide>
                    <PaginationDemo />
                </Specimen>
                <Specimen label="Tabs" wide>
                    <TabsDemo />
                </Specimen>
                <Specimen label="Stepper">
                    <Stepper steps={CHECKOUT_STEPS} currentIndex={1} />
                </Specimen>
                <Specimen label="Timeline">
                    <Timeline items={TIMELINE_ITEMS} />
                </Specimen>
            </Section>

            <Section id="feedback" title="Feedback and states">
                <Specimen label="Alert" wide>
                    <div className={styles.stack}>
                        <Alert tone="info" title="Delivery estimate">
                            Orders placed before 2 pm are dispatched the same day.
                        </Alert>
                        <Alert tone="success">Coupon applied successfully.</Alert>
                        <Alert tone="warning" title="Low stock">
                            Only a few units are left.
                        </Alert>
                        <Alert tone="danger" onDismiss={() => { }}>
                            Payment could not be started. Please try again.
                        </Alert>
                    </div>
                </Specimen>
                <Specimen label="EmptyState">
                    <EmptyState title="Your cart is empty" description="Add products to see them here." action={<Button>Continue shopping</Button>} />
                </Specimen>
                <Specimen label="ErrorState">
                    <ErrorState message="We couldn't load your orders." onRetry={() => { }} />
                </Specimen>
                <Specimen label="Loading, avatar, chips">
                    <div className={styles.stack}>
                        <div className={styles.row}>
                            <Spinner size="sm" />
                            <Spinner />
                            <Spinner size="lg" />
                            <Avatar name="Pawan Yadav" />
                            <Avatar name="Shivam" size="sm" />
                        </div>
                        <Skeleton height="1.25rem" width="60%" />
                        <Skeleton height="4rem" radius="8px" />
                        <div className={styles.row}>
                            <FilterChip label="Haldi" onRemove={() => { }} />
                            <FilterChip label="₹100 – ₹500" onRemove={() => { }} />
                        </div>
                    </div>
                </Specimen>
                <Specimen label="Card">
                    <Card title="Order summary" actions={<Button variant="link" size="sm">Edit</Button>}>
                        <SummaryRows rows={SUMMARY_ROWS.slice(0, 2)} />
                    </Card>
                </Specimen>
                <Specimen label="StatCard — stacked (dashboard)">
                    <div className={styles.stack}>
                        <StatCard label="Total revenue" value="₹4,82,560" delta="+12.4% vs last month" deltaTone="success" icon="currency-rupee" />
                        <StatCard label="Pending shipments" value="38" delta="–3 since yesterday" deltaTone="danger" />
                    </div>
                </Specimen>
                <Specimen label="StatCard — inline, selectable">
                    <StatCardDemo />
                </Specimen>
                <Specimen label="BulkActionBar" wide>
                    <BulkActionBar selectedCount={3} itemLabel="product" onClear={() => { }}>
                        <Button size="sm" variant="secondary">
                            Mark inactive
                        </Button>
                        <Button size="sm" variant="danger">
                            Delete
                        </Button>
                    </BulkActionBar>
                </Specimen>
            </Section>
        </>
    )
}

function SearchGalleryDemo() {
    const [value, setValue] = useState('')
    return <SearchField aria-label="Search products" value={value} onChange={setValue} placeholder="Search products" />
}

function SelectGalleryDemo() {
    const [category, setCategory] = useState('all')
    return (
        <FormField label="Category (react-select)">
            {(control) => (
                <SelectField id={control.id} prefixLabel="Category:" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
            )}
        </FormField>
    )
}

function QuantityStepperDemo() {
    const [quantity, setQuantity] = useState(2)
    return (
        <div className={styles.row}>
            <QuantityStepper value={quantity} onChange={setQuantity} max={10} />
            <QuantityStepper value={quantity} onChange={setQuantity} max={10} size="sm" />
            <span>Qty: {quantity}</span>
        </div>
    )
}

function PaginationDemo() {
    const [page, setPage] = useState(1)
    return <PaginationBar page={page} pageSize={6} totalItems={126} onPageChange={setPage} itemLabel="products" />
}

function TabsDemo() {
    const [tab, setTab] = useState('all')
    const [storeTab, setStoreTab] = useState('new')
    return (
        <div className={styles.stack}>
            <Tabs id="gallery-tabs" label="Product status" items={TAB_ITEMS} value={tab} onChange={setTab} />
            <TabPanel id="gallery-tabs" tabKey={tab} value={tab}>
                Panel for “{tab}”.
            </TabPanel>
            <Tabs id="gallery-store" label="Store operation" variant="pill" items={STORE_TABS} value={storeTab} onChange={setStoreTab} />
        </div>
    )
}

function StatCardDemo() {
    const [selected, setSelected] = useState(true)
    return (
        <div className={styles.stack}>
            <StatCard layout="inline" label="All products" value="126" selected={selected} onClick={() => setSelected((value) => !value)} />
            <StatCard layout="inline" label="Delayed orders" value="7" onClick={() => { }} />
        </div>
    )
}

export default function ComponentGallery() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="sh-container">
                    <h1>Component gallery</h1>
                    <p>Development reference with placeholder data. Not part of the customer or admin apps.</p>
                </div>
            </header>
            <nav className={styles.nav} aria-label="Gallery sections">
                <div className="sh-container d-flex gap-4">
                    {['tokens', 'buttons', 'badges', 'forms', 'commerce', 'navigation', 'feedback', 'overlays', 'table'].map((id) => (
                        <a key={id} href={`#${id}`}>
                            {id}
                        </a>
                    ))}
                </div>
            </nav>
            <main className="sh-container">
                <AtomSections />
                <OrganismSections />
            </main>
        </div>
    )
}