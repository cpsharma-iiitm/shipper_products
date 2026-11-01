// Home page copy and curated lists. This is marketing content, not business rules: wording, offers
// and testimonials are shown as written in the design.
// ASSUMPTION — confirm with business/backend team: banners, offers and testimonials come from a CMS,
// and the coupon terms below mirror the coupons returned by GET /offers.
import { paths } from '@/app/router/paths'

export const TRUST_POINTS = [
  { icon: 'patch-check', title: 'Authentic, always', detail: 'Quality-checked essentials', shortTitle: 'Quality checked', shortIcon: 'check2' },
  { icon: 'truck', title: 'India-wide delivery', detail: 'Tracked with India Post', shortTitle: 'India-wide delivery', shortIcon: 'arrow-up-right' },
  { icon: 'wallet2', title: 'More value, every day', detail: 'Offers & wallet rewards', shortTitle: null },
  { icon: 'lock', title: 'Pay your way', detail: 'Secure Razorpay checkout', shortTitle: 'Secure payment', shortIcon: 'credit-card-2-front' },
]

export const TESTIMONIALS = [
  {
    quote: 'The haldi is beautifully fresh. The quality is so much better than my usual supermarket buy.',
    author: 'Aditi Sharma',
    city: 'Lucknow',
  },
  {
    quote: 'My entire everyday routine in one order. Clear prices and delivery updates all the way.',
    compactQuote: 'My everyday routine in one order. Genuine products and lovely value.',
    author: 'Meera Nair',
    city: 'Kochi',
    showOnPhone: true,
  },
  {
    quote: 'The shampoo is a new favourite. Great packaging, genuine products, and lovely value.',
    author: 'Rohit Verma',
    city: 'Jaipur',
  },
]

export const SHELVES = {
  favourites: {
    collection: 'bestsellers',
    compactCodes: ['HL001', 'SH002'],
    to: paths.shop,
  },
  dailyCare: {
    collection: 'daily-care',
    compactCodes: ['PC003', 'CO004'],
    to: paths.category('personal-care'),
  },
}
