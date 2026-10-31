export default function StatCard({ label, value, trend }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem' }}>
      <div style={{ color: '#64748b', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{value}</div>
      {trend ? <div style={{ marginTop: 6, color: '#16a34a', fontSize: 12 }}>{trend}</div> : null}
    </div>
  );
}
