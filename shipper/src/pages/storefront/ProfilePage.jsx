import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/app/store'
import { AccountShell, PersonalDetailsCard, SavedAddressesCard } from '@/features/profile'
import { WalletSummaryCard } from '@/features/wallet'

export default function ProfilePage() {
  const firstName = useSelector(selectCurrentUser)?.name?.trim().split(/\s+/)[0]

  return (
    <AccountShell title={firstName ? `Hello, ${firstName}.` : 'Hello.'} description="Your details, addresses, and everyday rewards.">
      <PersonalDetailsCard />
      <SavedAddressesCard />
      <WalletSummaryCard />
    </AccountShell>
  )
}
