export const useStoreOperations = () => ({
  listStages: async () => [
    { name: 'New orders', count: 18 },
    { name: 'To pick', count: 12 },
    { name: 'Packed', count: 9 },
    { name: 'Ready to dispatch', count: 5 },
  ],
});
