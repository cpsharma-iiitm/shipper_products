export default function MobileTabBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #e2e8f0', padding: '0.8rem 1rem', background: '#fff', position: 'sticky', bottom: 0 }}>
      <span>Home</span>
      <span>Shop</span>
      <span>Cart</span>
      <span>Account</span>
    </div>
  );
}
