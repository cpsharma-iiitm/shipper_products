export default function WalletBalanceCard({ balance = 0 }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem' }}>
      <div style={{ color: '#64748b' }}>Wallet balance</div>
      <h3 style={{ margin: '0.5rem 0 0' }}>₹{balance}</h3>
    </div>
  );
}
