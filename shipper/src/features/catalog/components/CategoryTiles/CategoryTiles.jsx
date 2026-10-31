import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { paths } from '@/app/router/paths'
import Icon from '@/components/atoms/Icon'
import Skeleton from '@/components/atoms/Skeleton'
import SectionHeader from '@/features/catalog/components/SectionHeader'
import ResponsiveText from '@/features/catalog/components/ResponsiveText'
import { useCategories } from '@/features/catalog/hooks/useCatalog'
import styles from './CategoryTiles.module.scss'

const PHONE_TILE_COUNT = 3

/** "Everyday goodness, all in one place": a photo tile per category. Phones show three tiles and chips for the rest. */
export default function CategoryTiles() {
  const { data: categories, isPending, isError } = useCategories()

  if (isError) return null

  return (
    <section className={clsx('sh-container', styles.section)} aria-labelledby="category-tiles-heading">
      <SectionHeader
        id="category-tiles-heading"
        title={<ResponsiveText desktop="Everyday goodness, all in one place." mobile="Shop your everyday." />}
        description="Explore the essentials that make your day."
      />

      <ul className={styles.grid}>
        {isPending
          ? Array.from({ length: 5 }, (_, index) => (
              <li key={index} className={index >= PHONE_TILE_COUNT ? styles.desktopOnly : undefined}>
                <Skeleton height="var(--tile-image-height)" radius="var(--sh-radius-lg)" />
              </li>
            ))
          : categories.map((category, index) => (
              <li key={category.slug} className={index >= PHONE_TILE_COUNT ? styles.desktopOnly : undefined}>
                <Link to={paths.category(category.slug)} className={styles.tile}>
                  <span className={styles.picture}>
                    <img src={category.image} alt="" loading="lazy" className={styles.image} />
                  </span>
                  <span className={styles.label}>
                    {category.name}
                    <Icon name="arrow-up-right" className={styles.arrow} />
                  </span>
                </Link>
              </li>
            ))}
      </ul>

      {categories && (
        <ul className={styles.chips}>
          {categories.slice(PHONE_TILE_COUNT).map((category) => (
            <li key={category.slug}>
              <Link to={paths.category(category.slug)} className={styles.chip}>
                {category.name}
                <Icon name="arrow-right" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
