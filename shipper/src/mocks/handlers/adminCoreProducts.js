// DEV FIXTURES — admin product management handlers (list, create, edit, delete, bulk update, import,
// export). They mutate `db.products`, the same records the storefront catalogue reads, so an admin
// edit is visible to customers. The fake backend owns derived values (discount %, stock status,
// counts); the frontend only displays them.
// ASSUMPTION — confirm with backend team: every path, payload and response shape in this file.
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { db, getProduct } from '@/mocks/db'
import { FIXTURE_NOW } from '@/mocks/fixtures/clock'
import { requireAdmin } from '@/mocks/lib/auth'
import { matchesText, paginate, sortBy } from '@/mocks/lib/paginate'

const GST_RATES = [0, 5, 12, 18, 28]
const STOCK_FILTERS = { in: 'in_stock', low: 'low_stock', out: 'out_of_stock' }
const STOCK_SNAPSHOT = { updatedAt: '2026-10-28T10:32:00+05:30', warehouse: 'Lucknow warehouse' }
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Backend rule: out of stock at 0, low stock at or below the product's own threshold. */
export const stockStatusOf = (product) => {
  if (product.stock <= 0) return 'out_of_stock'
  return product.stock <= product.lowStockThreshold ? 'low_stock' : 'in_stock'
}

const isListed = (product) => !product.deletedAt
const listedProducts = () => db.products.filter(isListed)
const discountOf = (mrp, sellingPrice) => Math.round(((mrp - sellingPrice) / mrp) * 100)
const kebab = (text) =>
  String(text)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const toAdminProduct = (product) => ({
  code: product.code,
  slug: product.slug,
  name: product.name,
  category: product.category,
  categoryLabel: product.categoryLabel,
  unit: product.unit,
  batch: product.batch,
  hsn: product.hsn,
  gstPercent: product.gstPercent,
  stock: product.stock,
  lowStockThreshold: product.lowStockThreshold,
  pv: product.pv,
  mrp: product.mrp,
  sellingPrice: product.sellingPrice,
  discountPercent: product.discountPercent,
  status: product.status,
  stockStatus: stockStatusOf(product),
  image: product.image,
  thumbnail: product.thumbnail,
  description: product.description,
  updatedAt: product.updatedAt,
  updatedBy: product.updatedBy,
})

function filterProducts({ q, category = 'all', stock = 'all', status = 'all' }) {
  return listedProducts().filter(
    (product) =>
      matchesText(q, product.code, product.name, product.hsn, product.batch) &&
      (category === 'all' || product.category === category) &&
      (stock === 'all' || stockStatusOf(product) === STOCK_FILTERS[stock]) &&
      (status === 'all' || product.status === status),
  )
}

function countProducts() {
  const products = listedProducts()
  return {
    all: products.length,
    active: products.filter((product) => product.status === 'active').length,
    low: products.filter((product) => stockStatusOf(product) === 'low_stock').length,
    out: products.filter((product) => stockStatusOf(product) === 'out_of_stock').length,
  }
}

const toNumber = (value) => (typeof value === 'number' ? value : Number(String(value ?? '').trim()))

/** Server-side rules for a product payload. Returns { field: message } (empty when valid). */
function validateProduct(input, { creating }) {
  const errors = {}
  const text = (value) => String(value ?? '').trim()
  const mrp = toNumber(input.mrp)
  const sellingPrice = toNumber(input.sellingPrice)

  if (creating && !/^[A-Za-z0-9-]{3,16}$/.test(text(input.code))) errors.code = 'Use 3–16 letters, numbers or hyphens.'
  if (!text(input.name)) errors.name = 'Enter the product name.'
  if (!db.categories.some((category) => category.slug === input.category)) errors.category = 'Select a category.'
  if (!text(input.unit)) errors.unit = 'Select the pack size.'
  if (!text(input.batch)) errors.batch = 'Enter the batch number.'
  if (!/^(?:\d{6}|\d{8})$/.test(text(input.hsn))) errors.hsn = 'HSN must contain 6 or 8 digits.'
  if (!GST_RATES.includes(toNumber(input.gstPercent))) errors.gstPercent = 'Select a valid GST rate.'
  if (!(mrp > 0)) errors.mrp = 'MRP must be greater than 0.'
  if (!(sellingPrice > 0)) errors.sellingPrice = 'Selling price must be greater than 0.'
  else if (mrp > 0 && sellingPrice > mrp) errors.sellingPrice = 'Selling price cannot be higher than the MRP.'
  if (!Number.isInteger(toNumber(input.stock)) || toNumber(input.stock) < 0) errors.stock = 'Stock must be a whole number, 0 or more.'
  if (!Number.isInteger(toNumber(input.pv)) || toNumber(input.pv) < 0) errors.pv = 'PV must be a whole number, 0 or more.'
  if (input.status !== undefined && !['active', 'inactive'].includes(input.status)) errors.status = 'Choose Active or Inactive.'
  return errors
}

function rejectInvalid(errors) {
  if (Object.keys(errors).length === 0) return
  throw new MockHttpError(422, 'Please check the highlighted fields and try again.', {
    message: 'Please check the highlighted fields and try again.',
    errors,
  })
}

function applyFields(product, input, admin) {
  const category = db.categories.find((entry) => entry.slug === input.category)
  const mrp = toNumber(input.mrp)
  const sellingPrice = toNumber(input.sellingPrice)
  Object.assign(product, {
    name: String(input.name).trim(),
    category: category.slug,
    categoryLabel: category.name,
    unit: String(input.unit).trim(),
    batch: String(input.batch).trim(),
    hsn: String(input.hsn).trim(),
    gstPercent: toNumber(input.gstPercent),
    mrp,
    sellingPrice,
    discountPercent: discountOf(mrp, sellingPrice),
    stock: toNumber(input.stock),
    pv: toNumber(input.pv),
    status: input.status ?? product.status,
    description: String(input.description ?? '').trim(),
    updatedAt: FIXTURE_NOW,
    updatedBy: admin.name,
  })
  return product
}

function addProduct(input, admin) {
  const category = db.categories.find((entry) => entry.slug === input.category)
  const code = String(input.code).trim().toUpperCase()
  const sibling = db.products.find((product) => product.category === category.slug)
  const baseSlug = kebab(`${input.name} ${input.unit}`)
  let slug = baseSlug
  for (let suffix = 2; db.products.some((product) => product.slug === slug); suffix += 1) slug = `${baseSlug}-${suffix}`

  const product = {
    id: code,
    code,
    slug,
    group: kebab(input.name),
    lowStockThreshold: 10,
    rating: 0,
    reviewCount: 0,
    weightKg: 0.2,
    bin: 'UNASSIGNED',
    // A new product has no photography yet: the category tile stands in until an image is uploaded.
    image: category.image,
    thumbnail: category.image,
    gallery: [category.image],
    tagline: `${String(input.name).trim()} · ${String(input.unit).trim()}`,
    badge: null,
    ingredients: sibling?.ingredients ?? '',
    storage: sibling?.storage ?? '',
    packedBy: sibling?.packedBy ?? '',
    bestBefore: sibling?.bestBefore ?? '',
    walletRewards: false,
  }
  applyFields(product, { ...input, status: input.status ?? 'active' }, admin)
  db.products.push(product)
  return product
}

function findListedProduct(code) {
  const product = getProduct(code)
  if (!product || !isListed(product)) throw new MockHttpError(404, `Product ${code} was not found.`)
  return product
}

export const adminProductHandlers = [
  defineHandler('get', '/admin/products/options', ({ headers }) => {
    requireAdmin(headers)
    const units = [...new Set(listedProducts().map((product) => product.unit))].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    return {
      data: {
        categories: db.categories.map((category) => ({ value: category.slug, label: category.name })),
        units,
        gstRates: GST_RATES,
      },
    }
  }),

  defineHandler('get', '/admin/products/export', ({ query, headers }) => {
    requireAdmin(headers)
    const items = sortBy(filterProducts(query), query.sort).map(toAdminProduct)
    return { data: { generatedAt: FIXTURE_NOW, items } }
  }),

  defineHandler('get', '/admin/products', ({ query, headers }) => {
    requireAdmin(headers)
    const page = paginate(sortBy(filterProducts(query), query.sort), query)
    return { data: { ...page, items: page.items.map(toAdminProduct), counts: countProducts(), stock: STOCK_SNAPSHOT } }
  }),

  defineHandler('post', '/admin/products/bulk-update', ({ body, headers }) => {
    const admin = requireAdmin(headers)
    const { scope, changes = {} } = body ?? {}
    const errors = {}
    if (changes.status === undefined && changes.gstPercent === undefined) errors.changes = 'Choose at least one change to apply.'
    if (changes.status !== undefined && !['active', 'inactive'].includes(changes.status)) errors.status = 'Choose Active or Inactive.'
    if (changes.gstPercent !== undefined && !GST_RATES.includes(toNumber(changes.gstPercent))) errors.gstPercent = 'Select a valid GST rate.'
    rejectInvalid(errors)

    const targets = Array.isArray(scope?.codes)
      ? scope.codes.map(findListedProduct)
      : filterProducts(scope?.filters ?? {})
    targets.forEach((product) => {
      if (changes.status !== undefined) product.status = changes.status
      if (changes.gstPercent !== undefined) product.gstPercent = toNumber(changes.gstPercent)
      product.updatedAt = FIXTURE_NOW
      product.updatedBy = admin.name
    })
    return { data: { updated: targets.length } }
  }),

  // DEV FIXTURES: the real import runs server-side (validation, stock movements, audit log).
  defineHandler('post', '/admin/products/import', ({ body, headers }) => {
    const admin = requireAdmin(headers)
    const rows = Array.isArray(body?.rows) ? body.rows : []
    if (rows.length === 0) throw new MockHttpError(422, 'The file has no product rows.')

    const result = { created: 0, updated: 0, rejected: [] }
    rows.forEach((row) => {
      const categoryText = String(row.category ?? '').trim().toLowerCase()
      const category = db.categories.find((entry) => entry.slug === categoryText || entry.name.toLowerCase() === categoryText)
      const input = { ...row, category: category?.slug, status: row.status ? String(row.status).toLowerCase() : undefined }
      const existing = getProduct(String(row.code ?? '').trim().toUpperCase())
      const errors = validateProduct(input, { creating: !existing })
      if (existing && !isListed(existing)) errors.code = 'This product was deleted.'
      const [firstError] = Object.values(errors)
      if (firstError) {
        result.rejected.push({ rowNumber: row.rowNumber, code: row.code ?? '', message: firstError })
        return
      }
      if (existing) {
        applyFields(existing, input, admin)
        result.updated += 1
      } else {
        addProduct(input, admin)
        result.created += 1
      }
    })
    return { data: result }
  }),

  defineHandler('post', '/admin/products', ({ body, headers }) => {
    const admin = requireAdmin(headers)
    const errors = validateProduct(body ?? {}, { creating: true })
    rejectInvalid(errors)
    const code = String(body.code).trim().toUpperCase()
    if (getProduct(code)) rejectInvalid({ code: `A product with code ${code} already exists.` })
    return { status: 201, data: toAdminProduct(addProduct(body, admin)) }
  }),

  defineHandler('put', '/admin/products/:code', ({ params, body, headers }) => {
    const admin = requireAdmin(headers)
    const product = findListedProduct(params.code)
    rejectInvalid(validateProduct(body ?? {}, { creating: false }))
    return { data: toAdminProduct(applyFields(product, body, admin)) }
  }),

  // DEV FIXTURES: the image stays in the browser (object URL) until the page is reloaded.
  defineHandler('post', '/admin/products/:code/image', ({ params, body, headers }) => {
    const admin = requireAdmin(headers)
    const product = findListedProduct(params.code)
    const file = typeof body?.get === 'function' ? body.get('image') : null
    if (!file || typeof file === 'string') throw new MockHttpError(422, 'Choose an image to upload.')
    if (!['image/jpeg', 'image/png'].includes(file.type)) throw new MockHttpError(415, 'Upload a JPG or PNG image.')
    if (file.size > MAX_IMAGE_BYTES) throw new MockHttpError(413, 'The image must be 5 MB or smaller.')
    const url = URL.createObjectURL(file)
    Object.assign(product, { image: url, thumbnail: url, gallery: [url], updatedAt: FIXTURE_NOW, updatedBy: admin.name })
    return { data: toAdminProduct(product) }
  }),

  // Deleting hides the product everywhere but keeps the record, so past orders still resolve it.
  defineHandler('delete', '/admin/products/:code', ({ params, headers }) => {
    const admin = requireAdmin(headers)
    const product = findListedProduct(params.code)
    Object.assign(product, { status: 'inactive', deletedAt: FIXTURE_NOW, updatedAt: FIXTURE_NOW, updatedBy: admin.name })
    return { status: 204 }
  }),
]
