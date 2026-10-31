export default function ProductCard({ product = {}, onAddToCart }) {
  return (
    <article style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem', background: '#fff' }}>
      <div style={{ height: 140, borderRadius: 12, background: '#f1f5f9', display: 'grid', placeItems: 'center', marginBottom: 12 }}>Product</div>
      <div style={{ fontWeight: 700 }}>{product.name || 'Unnamed product'}</div>
      <div style={{ color: '#64748b', margin: '0.3rem 0 0.8rem' }}>{product.category || 'General'}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{product.price || 0}</strong>
        <button type="button" onClick={() => onAddToCart?.(product)}>Add</button>
      </div>
    </article>
  );
}
