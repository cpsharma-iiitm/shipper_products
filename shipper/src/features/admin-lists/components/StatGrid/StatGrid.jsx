export default function StatGrid({ stats = [] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
      {stats.map((stat) => (
        <div key={stat.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem' }}>
          <div style={{ color: '#64748b', fontSize: 13 }}>{stat.label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
