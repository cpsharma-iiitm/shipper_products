export default function AdminSidebar() {
  return (
    <aside style={{ width: 240, background: '#111827', color: '#fff', padding: '1.5rem' }}>
      <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>Shipper</div>
      <div style={{ display: 'grid', gap: 10 }}>
        <span>Dashboard</span>
        <span>Orders</span>
        <span>Products</span>
        <span>Customers</span>
        <span>Reports</span>
      </div>
    </aside>
  );
}
