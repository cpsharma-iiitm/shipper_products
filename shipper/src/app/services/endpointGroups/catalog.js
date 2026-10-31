// Storefront catalogue, offers, newsletter, cart and saved-products endpoints.
// ASSUMPTION — confirm with backend team: all paths, methods, query parameters and payload shapes.
export const catalogEndpoints = {
  catalog: {
    categories: '/categories',
    products: '/products',
    product: (slug) => `/products/${slug}`,
    related: (slug) => `/products/${slug}/related`,
    offers: '/offers',
    newsletter: '/newsletter/subscriptions',
    serviceability: '/serviceability',
  },
  cart: {
    quote: '/cart/quote',
  },
}