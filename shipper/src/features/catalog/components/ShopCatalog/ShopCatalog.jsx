export default function ShopCatalog({ products = [] }) {
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Popular picks</h2>
        <button type="button">View all</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {products.map((product) => (
          <article key={product.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16 }}>
            <div style={{ background: '#f1f5f9', height: 140, borderRadius: 12, display: 'grid', placeItems: 'center', marginBottom: 12 }}>Product</div>
            <div style={{ fontWeight: 700 }}>{product.name}</div>
            <div style={{ color: '#64748b', margin: '0.4rem 0 0.8rem' }}>{product.category}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>₹{product.price}</strong>
              <button type="button">Add</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
