export const useShipments = () => ({
  list: async () => [
    { id: 'SHP-1', status: 'In transit', city: 'Delhi' },
    { id: 'SHP-2', status: 'Packed', city: 'Bengaluru' },
  ],
});
