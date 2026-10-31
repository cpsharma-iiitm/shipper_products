import { Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#0f172a', color: '#fff', padding: '1.5rem' }}>
        <h3>Admin</h3>
        <nav style={{ display: 'grid', gap: '0.75rem' }}>
          <Link to="/admin" style={{ color: '#fff' }}>Dashboard</Link>
          <Link to="/admin/products" style={{ color: '#fff' }}>Products</Link>
          <Link to="/admin/orders" style={{ color: '#fff' }}>Orders</Link>
          <Link to="/admin/customers" style={{ color: '#fff' }}>Customers</Link>
          <Link to="/admin/reports" style={{ color: '#fff' }}>Reports</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
