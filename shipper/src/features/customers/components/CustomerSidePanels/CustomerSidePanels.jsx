import Badge from '@/components/atoms/Badge'
import Card from '@/components/atoms/Card'
import StatusBadge from '@/components/atoms/StatusBadge'
import AddressSummary from '@/components/molecules/AddressSummary'
import EmptyState from '@/components/molecules/EmptyState'
import SummaryRows from '@/components/molecules/SummaryRows'
import { formatMobile } from '@/lib/address'
import { formatDate } from '@/lib/date'
import styles from './CustomerSidePanels.module.scss'

const dash = (value) => value || '—'

function Profile({ customer }) {
  return (
    <Card title="Profile" padding="md" radius="md" actions={<StatusBadge status={customer.status} />}>
      <SummaryRows
        rows={[
          { label: 'Customer code', value: customer.code },
          { label: 'Mobile', value: customer.mobile ? formatMobile(customer.mobile) : '—' },
          { label: 'Email', value: dash(customer.email) },
          { label: 'City', value: [customer.city, customer.state].filter(Boolean).join(', ') || '—' },
          { label: 'PIN code', value: dash(customer.pin) },
          { label: 'Customer since', value: formatDate(customer.joinedAt) },
        ]}
      />
    </Card>
  )
}

function Addresses({ addresses }) {
  return (
    <Card title="Saved addresses" padding="md" radius="md">
      {addresses.length === 0 ? (
        <EmptyState compact icon="geo-alt" title="No saved addresses" description="Addresses the customer saves at checkout appear here." />
      ) : (
        <ul className={styles.addresses}>
          {addresses.map((address) => (
            <li key={address.id} className={styles.address}>
              <span className={styles.badges}>
                {address.label && <Badge tone="info">{address.label}</Badge>}
                {address.isDefault && <Badge tone="success">Default</Badge>}
              </span>
              <AddressSummary address={address} includeLandmark />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/** The right-hand column of the customer detail: profile and saved addresses (read-only). */
export default function CustomerSidePanels({ customer, addresses }) {
  return (
    <div className={styles.stack}>
      <Profile customer={customer} />
      <Addresses addresses={addresses} />
    </div>
  )
}
