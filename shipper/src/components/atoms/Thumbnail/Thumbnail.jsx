import clsx from 'clsx'
import Icon from '@/components/atoms/Icon'
import styles from './Thumbnail.module.scss'
const SIZES = { xs: 32, sm: 40, md: 56, lg: 72, xl: 96 }
/**
* Square product picture with a placeholder glyph when there is no image.
* size: xs 32 | sm 40 (admin tables) | md 56 | lg 72 | xl 96 — or a number of pixels
* Images are decorative by default (the product name is next to them); pass `alt` to describe one.
*/
export default function Thumbnail({ src, alt = '', size = 'sm', className }) {
  const dimension = typeof size === 'number' ? size : (SIZES[size] ?? SIZES.sm)
  return (
    <span className={clsx(styles.thumbnail, className)} style={{ '--thumbnail-size': `${dimension}px` }}>
      {src ? <img src={src} alt={alt} loading="lazy" className={styles.image} /> : <Icon name="box-seam" />}
    </span>
  )
}