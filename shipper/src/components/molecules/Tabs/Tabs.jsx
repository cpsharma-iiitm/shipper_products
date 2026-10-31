export default function Tabs({ items = [], active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map((item) => (
        <button key={item} type="button" onClick={() => onChange?.(item)} style={{ padding: '0.55rem 0.8rem', borderRadius: 10, border: '1px solid #cbd5e1', background: active === item ? '#0f172a' : '#fff', color: active === item ? '#fff' : '#0f172a', cursor: 'pointer' }}>
          {item}
        </button>
      ))}
    </div>
  );
}
