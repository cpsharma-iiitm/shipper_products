import { STOREFRONT } from '@/app/config/storefront'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import styles from './SupportCard.module.scss'

/** "Need a hand?": opens an email to support with the order number already in the subject line. */
export default function SupportCard({ orderNumber, className }) {
  const subject = encodeURIComponent(`Help with order ${orderNumber}`)

  return (
    <Card title="Need a hand?" padding="md" className={className}>
      <p className={styles.text}>Our team is here for delivery updates, returns, and everything in between.</p>
      <Button as="a" variant="secondary" size="sm" href={`mailto:${STOREFRONT.supportEmail}?subject=${subject}`}>
        Contact support
      </Button>
    </Card>
  )
}
