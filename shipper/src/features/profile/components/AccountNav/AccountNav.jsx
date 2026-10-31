export default function AccountNav() {
  return (
    <nav style={{ display: 'grid', gap: 8, padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
      <span>Profile</span>
      <span>Addresses</span>
      <span>Orders</span>
      <span>Saved items</span>
      <span>Wallet</span>
    </nav>
  );
}
