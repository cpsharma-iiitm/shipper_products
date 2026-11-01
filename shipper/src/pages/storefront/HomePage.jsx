import {
  CategoryTiles,
  EditorialBanner,
  HomeHero,
  NewsletterSignup,
  ProductShelf,
  PromiseSection,
  PromoBands,
  ResponsiveText,
  SHELVES,
  Testimonials,
  TrustStrip,
} from '@/features/catalog'

/** / — storefront home. */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <TrustStrip />
      <CategoryTiles />
      <PromoBands />
      <ProductShelf
        id="favourites-title"
        title={<ResponsiveText desktop="Your everyday favourites" mobile="Everyday favourites" />}
        description="Loved, re-ordered, and ready for your shelf."
        collection={SHELVES.favourites.collection}
        compactCodes={SHELVES.favourites.compactCodes}
        action={{ label: 'Shop bestsellers', to: SHELVES.favourites.to }}
      />
      <EditorialBanner />
      <ProductShelf
        id="daily-care-title"
        title={<ResponsiveText desktop="A little care goes a long way" mobile="A little daily care." />}
        description="Thoughtfully chosen for your daily rituals."
        collection={SHELVES.dailyCare.collection}
        compactCodes={SHELVES.dailyCare.compactCodes}
        action={{ label: 'Discover personal care', to: SHELVES.dailyCare.to }}
        phoneActionLabel={null}
      />
      <PromiseSection />
      <Testimonials />
      <NewsletterSignup />
    </>
  )
}
