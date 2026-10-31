export default function ProductGrid({ products = [] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
      {products.map((product) => (
        <article key={product.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem' }}>
          <div style={{ height: 140, borderRadius: 12, background: '#f1f5f9', display: 'grid', placeItems: 'center', marginBottom: 12 }}>IMG</div>
          <div style={{ fontWeight: 700 }}>{product.name}</div>
          <div style={{ color: '#64748b', margin: '0.3rem 0 0.6rem' }}>{product.category}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>₹{product.price}</strong>
            <button type="button">Add</button>
          </div>
        </article>
      ))}
    </div>
  );
}
