import Card from '@/components/atoms/Card'
import styles from './TrackingHelp.module.scss'

const TIPS = [
  { term: 'Order number', detail: 'Starts with SH. You’ll find it in your order confirmation, or under My orders when you’re signed in.' },
  { term: 'Mobile number', detail: 'The number on the order. We check it so only you can see your delivery progress.' },
  { term: 'Consignment ID', detail: 'Given once your parcel is dispatched: two letters, nine digits and IN, for example EU483920175IN.' },
]

/** Shown beside the form until a lookup succeeds: where to find each detail. */
export default function TrackingHelp() {
  return (
    <Card title="Where to find your details" padding="lg">
      <dl className={styles.tips}>
        {TIPS.map((tip) => (
          <div key={tip.term}>
            <dt className={styles.term}>{tip.term}</dt>
            <dd className={styles.detail}>{tip.detail}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
