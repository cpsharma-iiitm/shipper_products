export default function WalletTransactions({ rows = [] }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {rows.map((row) => (
        <div key={row.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
          <span>{row.label}</span>
          <strong>{row.amount >= 0 ? `+₹${row.amount}` : `-₹${Math.abs(row.amount)}`}</strong>
        </div>
      ))}
    </div>
  );
}
