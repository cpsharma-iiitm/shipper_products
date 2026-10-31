export default function OrderCard({ order = {} }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <strong>{order.id || 'SO-1001'}</strong>
        <span>{order.status || 'Confirmed'}</span>
      </div>
      <div style={{ marginTop: 10, color: '#64748b' }}>{order.customer || 'Customer'}</div>
      <div style={{ marginTop: 8, fontWeight: 700 }}>₹{order.total || 0}</div>
    </div>
  );
}
