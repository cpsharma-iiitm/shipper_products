export default function ProductDetail({ product = {} }) {
  return (
    <section style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        <div style={{ background: '#f1f5f9', minHeight: 420, borderRadius: 18, display: 'grid', placeItems: 'center' }}>Product gallery</div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
          <div style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 }}>{product.category || 'Featured'}</div>
          <h2 style={{ margin: '0.5rem 0' }}>{product.name || 'Product name'}</h2>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>₹{product.price || 0}</div>
          <p style={{ color: '#475569', lineHeight: 1.6 }}>{product.description || 'A premium product built for reliable everyday use.'}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <button type="button">Add to cart</button>
            <button type="button" variant="secondary">Buy now</button>
          </div>
        </div>
      </div>
    </section>
  );
}
