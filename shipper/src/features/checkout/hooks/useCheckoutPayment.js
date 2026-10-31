export const useCheckoutPayment = () => ({
  confirm: async (payload) => ({ ok: true, paymentId: 'PAY-1001', orderId: payload?.orderId || 'SO-1001' }),
});
