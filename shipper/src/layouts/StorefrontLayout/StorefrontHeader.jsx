export default function StorefrontHeader() {
  return (
    <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 22 }}>Shipper</strong>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>Shop</span>
          <span>Offers</span>
          <span>Track order</span>
          <span>Account</span>
        </div>
      </div>
    </header>
  );
}
