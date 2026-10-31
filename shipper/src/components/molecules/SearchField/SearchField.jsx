export default function SearchField({ value = '', placeholder = 'Search', onChange }) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '0.7rem 0.9rem', minWidth: 220 }}
    />
  );
}
