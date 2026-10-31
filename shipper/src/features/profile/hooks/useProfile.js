export const useProfile = () => ({
  get: async () => ({ name: 'Demo User', email: 'demo@shipper.com', phone: '+91 98765 43210' }),
  update: async (payload) => ({ ok: true, payload }),
});
