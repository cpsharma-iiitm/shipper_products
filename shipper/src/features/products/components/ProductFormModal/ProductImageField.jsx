import { useEffect, useRef, useState } from 'react'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import styles from './ProductImageField.module.scss'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

/**
 * Product picture with a "Replace image" button. The chosen file is checked for type and size (the
 * backend checks again), previewed locally and handed to `onChange`; it is uploaded when the form is saved.
 */
export default function ProductImageField({ src, alt, onChange }) {
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  const handleSelect = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Choose a JPG or PNG image.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('The image must be 5 MB or smaller.')
      return
    }
    setError(null)
    setPreviewUrl(URL.createObjectURL(file))
    onChange(file)
  }

  const shownSrc = previewUrl ?? src

  return (
    <div className={styles.field}>
      <div className={styles.frame}>
        {shownSrc ? <img src={shownSrc} alt={alt} className={styles.image} /> : <Icon name="image" className={styles.placeholder} />}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="visually-hidden" tabIndex={-1} aria-hidden="true" onChange={handleSelect} />
      <Button variant="secondary" size="sm" className={styles.button} onClick={() => inputRef.current?.click()}>
        {src || previewUrl ? 'Replace image' : 'Upload image'}
      </Button>
      <p className={styles.hint}>JPG or PNG, up to 5 MB. Recommended 1200 × 1200 px.</p>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
