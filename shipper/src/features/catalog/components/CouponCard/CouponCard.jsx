import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import { useCopyToClipboard } from '@/features/catalog/hooks/useCopyToClipboard'
import { formatINR } from '@/lib/format'
import styles from './CouponCard.module.scss'

const COPIED_LABEL_MS = 2000

/**
 * One coupon on the offers page: what it gives, its conditions and a copy-code button. The coupon is
 * applied in the cart, where the backend decides whether it is valid for the order.
 * tone: primary | sand
 */
export default function CouponCard({ coupon, tone = 'primary' }) {
  const copy = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const timer = setTimeout(() => setCopied(false), COPIED_LABEL_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    if (await copy(coupon.code)) {
      setCopied(true)
      toast.success(`${coupon.code} copied. Apply it in your cart.`, { toastId: `coupon-copied-${coupon.code}` })
    } else {
      toast.error(`We couldn’t copy it for you. Your code is ${coupon.code}.`, { toastId: `coupon-copy-failed-${coupon.code}` })
    }
  }

  return (
    <article className={clsx(styles.card, styles[tone])}>
      <div className={styles.details}>
        <p className={styles.eyebrow}>{coupon.firstOrderOnly ? 'First order only' : 'Every order'}</p>
        <h3 className={styles.title}>{coupon.title}</h3>
        <p className={styles.description}>{coupon.description}</p>
        <ul className={styles.terms}>
          <li>Min. order {formatINR(coupon.minOrderValue)}</li>
          {coupon.maxDiscount !== null && <li>Up to {formatINR(coupon.maxDiscount)} off</li>}
        </ul>
      </div>

      <div className={styles.redeem}>
        <p className={styles.code}>
          <span className={styles.codeLabel}>Code</span>
          {coupon.code}
        </p>
        <Button
          variant={copied ? 'primary' : 'secondary'}
          size="lg"
          leftIcon={copied ? 'check2' : 'copy'}
          onClick={handleCopy}
          aria-label={copied ? `${coupon.code} copied` : `Copy code ${coupon.code}`}
        >
          {copied ? 'Copied' : 'Copy code'}
        </Button>
      </div>
    </article>
  )
}
