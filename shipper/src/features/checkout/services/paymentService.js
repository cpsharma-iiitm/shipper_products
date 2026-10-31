export const paymentService = {
  createIntent: async (order) => ({ ok: true, order, gateway: 'mock_gateway' }),
  confirm: async (paymentId) => ({ ok: true, paymentId, status: 'paid' }),
};
