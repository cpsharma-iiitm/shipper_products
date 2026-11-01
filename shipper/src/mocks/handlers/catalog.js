// DEV FIXTURES — storefront catalogue, offers and newsletter for the mock API. Not an integration.
//
// ASSUMPTION — confirm with backend team: every path, query parameter and response shape below.
// The backend owns filtering, sorting, paging, availability and the savings figure; the storefront
// only displays what these endpoints return.
import { defineHandler, MockHttpError } from '@/mocks/adapter'
import { productImage } from '@/mocks/assets'
import { db, getProductBySlug } from '@/mocks/db'
import { matchesText, paginate, sortBy, toFlag } from '@/mocks/lib/paginate'
import { COUPONS, FREE_SHIPPING_THRESHOLD } from '@/mocks/lib/quote'

const DEFAULT_PAGE_SIZE = 12
const MAX_PURCHASE_QUANTITY = 10
const RELATED_COUNT = 4

// Curated merchandising lists for the home page. The backend would manage these.
const COLLECTIONS = {
  bestsellers: ['HL001', 'SH002', 'PC003', 'CO004'],
  'daily-care': ['SH002', 'PC003', 'CO004', 'PC006'],
}

// "A few more good things" on the flagship product page, as designed.
const CURATED_RELATED = { HL001: ['GR005', 'SH002', 'PC003', 'PC006'] }

// Extra photography for the flagship product page; the catalogue fixtures hold only card crops.
const HERO_IMAGES = { haldi: 'haldi-hero' }

// Sample reviews: one written for each category plus two general ones. The real review list is paged by the backend.
const CATEGORY_REVIEWS = {
  haldi: {
    quote: 'Beautiful colour and a lovely fresh aroma. A small pinch goes a long way in our everyday cooking.',
    author: 'Aditi Sharma',
    reviewedAt: '2026-10-20',
  },
  shampoo: {
    quote: 'Gentle on my scalp and the fragrance is lovely. My hair feels softer after just a couple of washes.',
    author: 'Rohit Verma',
    reviewedAt: '2026-10-18',
  },
  cosmetics: {
    quote: 'Comfortable all day and the colour is just right. It has become part of my daily routine.',
    author: 'Meera Nair',
    reviewedAt: '2026-10-22',
  },
  grocery: {
    quote: 'Fresh, clean and well packed. The quality is clearly better than what I used to buy.',
    author: 'Meera Nair',
    reviewedAt: '2026-10-19',
  },
  'personal-care': {
    quote: 'Light, kind to my skin and not sticky at all. I have already ordered it again.',
    author: 'Aditi Sharma',
    reviewedAt: '2026-10-21',
  },
}

const GENERAL_REVIEWS = [
  { quote: 'Arrived well packed and on time. Exactly as described, and good value for the price.', author: 'Rohit Verma', reviewedAt: '2026-10-15' },
  { quote: 'I have reordered twice now. Genuine product and honest pricing.', author: 'Meera Nair', reviewedAt: '2026-10-09' },
]

const CARE_NOTES = {
  haldi: 'Keep the pouch sealed after every use.',
  shampoo: 'Close the cap tightly after every use.',
  cosmetics: 'Close the cap tightly after every use.',
  grocery: 'Keep the pack sealed after every use.',
  'personal-care': 'Close the cap tightly after every use.',
}

const activeProducts = () => db.products.filter((product) => product.status === 'active')

function availabilityOf(product) {
  if (product.status !== 'active' || product.stock <= 0) return { stockStatus: 'out_of_stock', lowStockLeft: null }
  if (product.stock <= product.lowStockThreshold) return { stockStatus: 'low_stock', lowStockLeft: product.stock }
  return { stockStatus: 'in_stock', lowStockLeft: null }
}

function toListItem(product) {
  return {
    code: product.code,
    slug: product.slug,
    name: product.name,
    unit: product.unit,
    category: product.category,
    categoryLabel: product.categoryLabel,
    image: product.image,
    mrp: product.mrp,
    sellingPrice: product.sellingPrice,
    discountPercent: product.discountPercent,
    rating: product.rating,
    reviewCount: product.reviewCount,
    badge: product.badge,
    walletRewards: product.walletRewards,
    purchaseLimit: Math.max(0, Math.min(product.stock, MAX_PURCHASE_QUANTITY)),
    ...availabilityOf(product),
  }
}

// Hero shot first, then the detail shots (bowl, field…), then the product's card crops.
function galleryOf(product) {
  const hero = HERO_IMAGES[product.category] && productImage(HERO_IMAGES[product.category])
  const urls = [hero ?? product.thumbnail, ...product.gallery.slice(2), product.image, product.gallery[1]]
  return [...new Set(urls.filter(Boolean))].map((url, index) => ({ url, alt: `${product.name}, photo ${index + 1}` }))
}

function toDetail(product) {
  const variants = activeProducts()
    .filter((entry) => entry.group === product.group)
    .map((entry) => ({
      code: entry.code,
      slug: entry.slug,
      unit: entry.unit,
      mrp: entry.mrp,
      sellingPrice: entry.sellingPrice,
      stockStatus: availabilityOf(entry).stockStatus,
      isCurrent: entry.code === product.code,
    }))

  return {
    ...toListItem(product),
    tagline: product.tagline,
    description: product.description,
    ingredients: product.ingredients,
    netQuantity: product.unit,
    batch: product.batch,
    bestBefore: product.bestBefore,
    hsn: product.hsn,
    gstPercent: product.gstPercent,
    storage: product.storage,
    packedBy: product.packedBy,
    careNote: CARE_NOTES[product.category],
    availableQuantity: Math.max(0, product.stock),
    savings: product.mrp - product.sellingPrice,
    gallery: galleryOf(product),
    variants,
    reviews: {
      average: product.rating,
      count: product.reviewCount,
      highlights: [CATEGORY_REVIEWS[product.category], ...GENERAL_REVIEWS].map((review) => ({ ...review, verified: true })),
    },
  }
}

function parseNumber(value) {
  const parsed = Number(value)
  return value === undefined || value === '' || !Number.isFinite(parsed) ? null : parsed
}

// Every filter except category and price is applied here; those two are applied by the callers so
// the facets can be computed "as if" the facet's own filter were not set.
function applyBaseFilters(list, query) {
  const minDiscount = parseNumber(query.minDiscount)
  const minRating = parseNumber(query.minRating)
  const collection = COLLECTIONS[query.collection]

  return list.filter((product) => {
    if (!matchesText(query.q, product.name, product.categoryLabel, product.code, product.tagline)) return false
    if (collection && !collection.includes(product.code)) return false
    if (toFlag(query.inStock) && availabilityOf(product).stockStatus === 'out_of_stock') return false
    if (minDiscount !== null && product.discountPercent < minDiscount) return false
    if (minRating !== null && product.rating < minRating) return false
    if (toFlag(query.walletRewards) && !product.walletRewards) return false
    return true
  })
}

function applyPriceFilter(list, query) {
  const min = parseNumber(query.minPrice)
  const max = parseNumber(query.maxPrice)
  return list.filter((product) => (min === null || product.sellingPrice >= min) && (max === null || product.sellingPrice <= max))
}

const applyCategoryFilter = (list, category) => (category ? list.filter((product) => product.category === category) : list)

function sortProducts(list, query) {
  const collection = COLLECTIONS[query.collection]
  switch (query.sort) {
    case 'price_asc':
      return sortBy(list, 'sellingPrice')
    case 'price_desc':
      return sortBy(list, '-sellingPrice')
    case 'discount':
      return sortBy(list, '-discountPercent')
    case 'newest':
      return [...list].reverse()
    default:
      return collection ? [...list].sort((a, b) => collection.indexOf(a.code) - collection.indexOf(b.code)) : [...list]
  }
}

function buildFacets(base, query) {
  const withoutCategory = applyPriceFilter(base, query)
  const withoutPrice = applyCategoryFilter(base, query.category)
  const prices = withoutPrice.map((product) => product.sellingPrice)
  return {
    categories: db.categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      count: withoutCategory.filter((product) => product.category === category.slug).length,
    })),
    priceBounds: prices.length ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) } : { min: 0, max: 0 },
  }
}

function relatedTo(product) {
  const curated = CURATED_RELATED[product.code]
  const pool = activeProducts().filter((entry) => entry.group !== product.group && availabilityOf(entry).stockStatus !== 'out_of_stock')
  if (curated) return curated.map((code) => pool.find((entry) => entry.code === code)).filter(Boolean)

  // One product from each other category first, then more from the same category.
  const otherCategories = db.categories.filter((category) => category.slug !== product.category)
  const spread = otherCategories.map((category) => pool.find((entry) => entry.category === category.slug)).filter(Boolean)
  const sameCategory = pool.filter((entry) => entry.category === product.category)
  return [...spread, ...sameCategory].slice(0, RELATED_COUNT)
}

function offerFromCoupon(coupon) {
  return {
    code: coupon.code,
    title: coupon.percent
      ? `${coupon.percent}% off ${coupon.firstOrderOnly ? 'your first order' : 'your order'}`
      : `₹${coupon.flat} off your order`,
    description: coupon.description,
    maxDiscount: coupon.cap ?? null,
    minOrderValue: coupon.minItemsTotal,
    firstOrderOnly: coupon.firstOrderOnly,
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const catalogHandlers = [
  defineHandler('get', '/categories', () => {
    const products = activeProducts()
    return {
      data: {
        items: db.categories.map((category) => ({
          slug: category.slug,
          name: category.name,
          description: category.description,
          image: category.image,
          productCount: products.filter((product) => product.category === category.slug).length,
        })),
      },
    }
  }),

  // Query: q, category, collection, minPrice, maxPrice, inStock, minDiscount, minRating, walletRewards,
  //        sort (recommended | price_asc | price_desc | discount | newest), page, pageSize.
  // Customers only ever see active products.
  defineHandler('get', '/products', ({ query }) => {
    const base = applyBaseFilters(activeProducts(), query)
    const matches = sortProducts(applyPriceFilter(applyCategoryFilter(base, query.category), query), query)
    const page = paginate(matches, { page: query.page, pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE })
    return { data: { ...page, items: page.items.map(toListItem), facets: buildFacets(base, query) } }
  }),

  defineHandler('get', '/products/:slug', ({ params }) => {
    const product = getProductBySlug(params.slug)
    if (!product || product.status !== 'active') throw new MockHttpError(404, 'This product is no longer available.')
    return { data: toDetail(product) }
  }),

  defineHandler('get', '/products/:slug/related', ({ params }) => {
    const product = getProductBySlug(params.slug)
    if (!product || product.status !== 'active') throw new MockHttpError(404, 'This product is no longer available.')
    return { data: { items: relatedTo(product).map(toListItem) } }
  }),

  defineHandler('get', '/offers', () => ({
    data: { coupons: Object.values(COUPONS).map(offerFromCoupon), freeShippingThreshold: FREE_SHIPPING_THRESHOLD },
  })),

  defineHandler('post', '/newsletter/subscriptions', ({ body }) => {
    const email = String(body?.email ?? '').trim().toLowerCase()
    if (!EMAIL_PATTERN.test(email)) throw new MockHttpError(422, 'Enter a valid email address.')
    return { status: 201, data: { email, status: 'subscribed' } }
  }),
]
