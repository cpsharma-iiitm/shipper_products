export default function StorefrontFooter() {
  return (
    <footer style={{ marginTop: '2rem', background: '#0f172a', color: '#fff', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
        <div><strong>Shipper</strong><div>Modern commerce workflows</div></div>
        <div>Shipping</div>
        <div>Returns</div>
        <div>Support</div>
      </div>
    </footer>
  );
}
