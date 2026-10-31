export const useAdminProfile = () => ({
  get: async () => ({ name: 'Aditi Rao', role: 'Operations Lead', email: 'aditi@shipper.com' }),
  update: async (payload) => ({ ok: true, payload }),
});
