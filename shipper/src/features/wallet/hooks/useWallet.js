import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getWallet, listWalletTransactions } from '@/features/wallet/services/walletService'

export const walletKeys = {
  all: ['wallet'],
  summary: () => ['wallet', 'summary'],
  transactions: (paging) => ['wallet', 'transactions', paging],
}

export const WALLET_PAGE_SIZE = 8

/** Balance, last credit and the rules the backend applies at checkout. */
export function useWallet() {
  return useQuery({ queryKey: walletKeys.summary(), queryFn: getWallet })
}

export function useWalletTransactions({ page, pageSize = WALLET_PAGE_SIZE }) {
  return useQuery({
    queryKey: walletKeys.transactions({ page, pageSize }),
    queryFn: () => listWalletTransactions({ page, pageSize }),
    placeholderData: keepPreviousData,
  })
}
