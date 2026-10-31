export default function CategoryNav({ items = ['New Arrivals', 'Best Sellers', 'Home', 'Fashion', 'Beauty'] }) {
  return (
    <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '0.8rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
      {items.map((item) => (
        <span key={item} style={{ color: '#334155', fontSize: 14, fontWeight: 600 }}>{item}</span>
      ))}
    </nav>
  );
}
