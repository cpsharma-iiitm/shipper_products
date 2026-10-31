export default function ReportsOverview({ data = {} }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem' }}><div style={{ color: '#64748b' }}>Sales</div><h3>{data.sales || 0}</h3></div>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem' }}><div style={{ color: '#64748b' }}>Refunds</div><h3>{data.refunds || 0}</h3></div>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem' }}><div style={{ color: '#64748b' }}>AOV</div><h3>{data.averageOrderValue || 0}</h3></div>
    </div>
  );
}
