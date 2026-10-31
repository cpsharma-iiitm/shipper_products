export default function Timeline({ items = [] }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map((item, index) => (
        <div key={item.label || index} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0f172a', marginTop: 6 }} />
          <div>
            <div style={{ fontWeight: 700 }}>{item.label}</div>
            {item.value ? <div style={{ color: '#64748b', fontSize: 13 }}>{item.value}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
