import { paths } from '@/app/router/paths'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'
import ResponsiveText from '@/features/catalog/components/ResponsiveText'
import { formatNumber } from '@/lib/format'
import styles from './ShopIntro.module.scss'

/** Breadcrumbs, page title and supporting line for the catalogue, worded for browsing, a category or a search. */
export default function ShopIntro({ category, categoryDescription, searchText, totalItems }) {
  const countText = totalItems === undefined ? '' : `${formatNumber(totalItems)} thoughtful finds for your everyday.`
  let crumb = 'Everyday essentials'
  let title = <ResponsiveText desktop="Find your everyday favourites" mobile="Everyday essentials" />
  let description = <ResponsiveText desktop="Quality essentials. Thoughtful prices. All in one place." mobile={countText} />

  if (searchText) {
    crumb = 'Search results'
    title = `Results for “${searchText}”`
    description = totalItems === undefined ? '' : `${formatNumber(totalItems)} ${totalItems === 1 ? 'product' : 'products'} found.`
  } else if (category) {
    crumb = category.label
    title = category.label
    description = categoryDescription
  }

  return (
    <header className={styles.intro}>
      <Breadcrumbs
        className={styles.breadcrumbs}
        items={[{ label: 'Home', to: paths.home }, { label: 'Shop', to: paths.shop }, { label: crumb }]}
      />
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  )
}
