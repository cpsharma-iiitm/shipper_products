export const useAdminLogin = () => ({
  login: async (values) => ({ ok: true, user: { name: 'Admin', role: 'ops' }, token: 'admin-token' }),
});
