// The five storefront categories named in the product brief. The backend may return counts and
// images per category; the slugs and labels used for navigation live here.
export const CATEGORIES = [
{ slug: 'haldi', label: 'Haldi' },
{ slug: 'shampoo', label: 'Shampoo' },
{ slug: 'cosmetics', label: 'Cosmetics' },
{ slug: 'grocery', label: 'Grocery' },
{ slug: 'personal-care', label: 'Personal Care' },
]
export const getCategoryLabel = (slug) => CATEGORIES.find((category) => category.slug === slug)?.label ?? slug