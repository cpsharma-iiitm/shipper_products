export const walletService = {
  balance: async () => ({ balance: 2450, currency: 'INR' }),
  transactions: async () => [
    { id: 'T-1', label: 'Order payment', amount: -1499 },
    { id: 'T-2', label: 'Wallet credit', amount: 2000 },
  ],
};
