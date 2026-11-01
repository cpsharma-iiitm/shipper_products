import { AccountShell, SavedProductList } from '@/features/profile'

export default function SavedPage() {
  return (
    <AccountShell title="Saved products" description="Everything you’ve kept for later, ready to add to your cart.">
      <SavedProductList />
    </AccountShell>
  )
}
