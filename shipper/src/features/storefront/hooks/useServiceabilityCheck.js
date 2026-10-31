export const useServiceabilityCheck = () => ({
  check: async (pincode, productId) => ({
    serviceable: true,
    etaDays: 3,
    message: 'Delivery available at this pincode',
    pincode,
    productId,
  }),
});
