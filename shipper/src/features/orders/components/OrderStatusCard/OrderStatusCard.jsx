export default function OrderStatusCard({ title = 'Order status', value = 'Pending' }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem' }}>
      <div style={{ color: '#64748b', fontSize: 13 }}>{title}</div>
      <div style={{ marginTop: 8, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
