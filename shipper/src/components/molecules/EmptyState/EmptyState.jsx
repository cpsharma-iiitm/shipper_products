export default function EmptyState({ title = 'No data', description = 'Nothing to show yet.' }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
      <h3 style={{ marginBottom: 6 }}>{title}</h3>
      <p style={{ margin: 0 }}>{description}</p>
    </div>
  );
}
