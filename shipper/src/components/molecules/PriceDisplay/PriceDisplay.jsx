export default function PriceDisplay({ value = 0, currency = 'INR', style = {} }) {
  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency });
  return <span style={{ fontWeight: 700, ...style }}>{formatter.format(value)}</span>;
}
