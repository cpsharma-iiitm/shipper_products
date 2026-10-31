export const serviceabilityService = {
  check: async (pincode, productId) => ({
    pincode,
    productId,
    serviceable: true,
    etaDays: 3,
    available: true,
  }),
};
