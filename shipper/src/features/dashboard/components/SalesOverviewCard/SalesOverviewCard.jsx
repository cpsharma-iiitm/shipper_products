export default function SalesOverviewCard({ title = 'Sales overview', value = 0 }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem 1.1rem' }}>
      <div style={{ color: '#64748b', fontSize: 13 }}>{title}</div>
      <div style={{ fontWeight: 800, fontSize: 30, marginTop: 8 }}>₹{value}</div>
    </div>
  );
}
