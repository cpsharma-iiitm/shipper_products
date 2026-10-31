export default function SummaryRows({ rows = [] }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {rows.map((row) => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 14 }}>
          <span style={{ color: '#64748b' }}>{row.label}</span>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}
