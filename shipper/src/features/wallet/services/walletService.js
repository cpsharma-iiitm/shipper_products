import { endpoints, http } from '@/app/services'

// ASSUMPTION — confirm with backend team. The wallet summary is
//   { balance, lastCredit: { amount, kind: 'refund' | 'cashback' | 'bonus' | 'credit', at } | null,
//     rules: { maxPerOrder, combinableWithCoupon } }
// `rules` only describes what the backend enforces at checkout; the screens never apply them.
// A ledger entry is { id, type: 'credit' | 'debit', kind, amount, reason, orderNumber | null, at } and the ledger
// is paged, newest first: { items, page, pageSize, totalItems, pageCount }.

export async function getWallet() {
  const { data } = await http.get(endpoints.account.wallet)
  return data
}

export async function listWalletTransactions({ page, pageSize }) {
  const { data } = await http.get(endpoints.account.walletTransactions, { params: { page, pageSize } })
  return data
}
