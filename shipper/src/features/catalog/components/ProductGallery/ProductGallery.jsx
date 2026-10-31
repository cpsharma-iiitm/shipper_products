import { useState } from 'react'
import clsx from 'clsx'
import styles from './ProductGallery.module.scss'

const VISIBLE_THUMBNAILS = 3

/** Main photo with a thumbnail strip; photos beyond the first three sit behind a "+N photos" tile. */
export default function ProductGallery({ images, name }) {
  const [selected, setSelected] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const hiddenCount = images.length - VISIBLE_THUMBNAILS
  const showAll = expanded || hiddenCount <= 0
  const thumbnails = showAll ? images : images.slice(0, VISIBLE_THUMBNAILS)

  return (
    <div className={styles.gallery}>
      <div className={styles.stage}>
        <img src={images[selected].url} alt={images[selected].alt} className={styles.image} />
      </div>
      <ul className={styles.thumbnails} aria-label={`${name} photos`}>
        {thumbnails.map((image, index) => (
          <li key={image.url}>
            <button
              type="button"
              className={clsx(styles.thumbnail, index === selected && styles.active)}
              aria-label={`Show photo ${index + 1} of ${images.length}`}
              aria-current={index === selected ? 'true' : undefined}
              onClick={() => setSelected(index)}
            >
              <img src={image.url} alt="" loading="lazy" />
            </button>
          </li>
        ))}
        {!showAll && (
          <li>
            <button type="button" className={styles.more} onClick={() => setExpanded(true)}>
              +{hiddenCount} {hiddenCount === 1 ? 'photo' : 'photos'}
            </button>
          </li>
        )}
      </ul>
    </div>
  )
}
