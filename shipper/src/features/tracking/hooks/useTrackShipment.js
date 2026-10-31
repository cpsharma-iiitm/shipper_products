export const useTrackShipment = () => ({
  track: async (orderId) => ({ orderId, status: 'In transit', eta: 'Tomorrow' }),
});
