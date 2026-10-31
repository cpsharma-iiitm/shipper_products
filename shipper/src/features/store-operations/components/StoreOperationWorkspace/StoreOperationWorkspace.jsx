export default function StoreOperationWorkspace({ stages = [] }) {
  return (
    <section>
      <h2>Operations workspace</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {stages.map((stage) => (
          <div key={stage.name} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem' }}>
            <div style={{ fontWeight: 700 }}>{stage.name}</div>
            <div style={{ color: '#64748b', marginTop: 6 }}>{stage.count || 0} items</div>
          </div>
        ))}
      </div>
    </section>
  );
}
