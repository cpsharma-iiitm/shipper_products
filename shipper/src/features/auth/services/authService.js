export const authService = {
  login: async ({ email, password }) => ({ ok: true, user: { email, role: 'customer' }, token: 'demo-token' }),
  signup: async ({ email, password }) => ({ ok: true, user: { email, role: 'customer' }, token: 'demo-token' }),
  logout: async () => ({ ok: true }),
};
