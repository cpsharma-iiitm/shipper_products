import { AccountShell } from '@/features/profile'
import { WalletBalanceCard, WalletTransactions } from '@/features/wallet'

export default function WalletPage() {
  return (
    <AccountShell title="Wallet & rewards" description="Your Shipper balance and everything that has moved it.">
      <WalletBalanceCard />
      <WalletTransactions />
    </AccountShell>
  )
}
