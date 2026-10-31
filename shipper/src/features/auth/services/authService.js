export const authService = {
  login: async (payload) => ({ ok: true, user: { name: 'Demo User', role: payload.role || 'customer' } }),
  signup: async (payload) => ({ ok: true, user: { name: payload.name || 'New User', role: 'customer' } }),
};
