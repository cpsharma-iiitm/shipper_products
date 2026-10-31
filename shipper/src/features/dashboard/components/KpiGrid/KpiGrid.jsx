export default function KpiGrid({ stats = [] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
      {stats.map((stat) => (
        <div key={stat.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem' }}>
          <div style={{ color: '#64748b', fontSize: 13 }}>{stat.label}</div>
          <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800 }}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
