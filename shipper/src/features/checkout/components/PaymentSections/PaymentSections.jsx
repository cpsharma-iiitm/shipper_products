import Card from '@/components/atoms/Card'
import { CHECKOUT_COPY } from '@/features/checkout/lib/checkoutCopy'
import PaymentMethodPicker from '@/features/checkout/components/PaymentMethodPicker'
import TermsConsent from '@/features/checkout/components/TermsConsent'
import WalletOption from '@/features/checkout/components/WalletOption'
import styles from './PaymentSections.module.scss'

/**
 * Wallet and payment method. Desktop shows them as one "Wallet & payment" card that also holds the terms;
 * below that the wallet and the payment window are separate cards and the terms sit by the Pay button.
 */
export default function PaymentSections({ compact, wallet, useWallet, onWalletChange, payable }) {
  const walletOption = <WalletOption wallet={wallet} checked={useWallet} onChange={onWalletChange} compact={compact} />
  const picker = <PaymentMethodPicker compact={compact} payable={payable} />

  if (compact) {
    return (
      <>
        <Card title={CHECKOUT_COPY.compact.walletTitle} padding="sm">{walletOption}</Card>
        <Card title={CHECKOUT_COPY.compact.paymentTitle} padding="sm">{picker}</Card>
      </>
    )
  }

  return (
    <Card title={CHECKOUT_COPY.wide.walletPaymentTitle}>
      {walletOption}
      <div className={styles.divider} />
      {picker}
      <div className={styles.terms}>
        <TermsConsent />
      </div>
    </Card>
  )
}
