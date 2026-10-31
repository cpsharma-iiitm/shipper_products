export default function QuantityStepper({ value = 1, min = 1, onChange }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #cbd5e1', borderRadius: 10, padding: '0.25rem 0.5rem' }}>
      <button type="button" onClick={() => onChange?.(Math.max(min, value - 1))}>-</button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange?.(value + 1)}>+</button>
    </div>
  );
}
