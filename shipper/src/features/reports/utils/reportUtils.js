export const reportHelpers = {
  growthPercent: (value, baseline) => baseline === 0 ? 0 : ((value - baseline) / baseline) * 100,
  formatCurrency: (value) => `₹${value.toLocaleString('en-IN')}`,
};
