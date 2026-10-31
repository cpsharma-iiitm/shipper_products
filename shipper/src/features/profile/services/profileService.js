export const profileService = {
  getProfile: async () => ({ name: 'Demo User', email: 'demo@shipper.com' }),
  updateProfile: async (payload) => ({ ok: true, profile: payload }),
};
