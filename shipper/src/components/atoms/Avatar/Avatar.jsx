import clsx from 'clsx'
import styles from './Avatar.module.scss'
function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase()
}
/** Round initials badge ("PY" for Pawan Yadav), or the image when `src` is provided. */
export default function Avatar({ name, src, size = 'md', className }) {
  return (
    <span role="img" aria-label={name || 'User'} className={clsx(styles.avatar, styles[size], className)}>
      {src ? <img src={src} alt="" className={styles.image} /> : getInitials(name)}
    </span>
  )
}