import { Link } from 'react-router-dom';

export default function StorefrontLayout() {
  return (
    <div>
      <header style={{ padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/shop" style={{ fontWeight: 700, textDecoration: 'none', color: '#0f172a' }}>Shipper</Link>
        <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/shop">Shop</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </header>
      <main style={{ padding: '2rem' }}>
        <Link to="/shop">Browse products</Link>
      </main>
    </div>
  );
}
