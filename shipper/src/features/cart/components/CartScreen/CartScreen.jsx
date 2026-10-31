export default function CartScreen({ items = [] }) {
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);

  return (
    <section>
      <h2>Your cart</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.length ? items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
            <span>{item.name}</span>
            <strong>₹{(item.price || 0) * (item.qty || 1)}</strong>
          </div>
        )) : <p>Cart is empty</p>}
      </div>
      <div style={{ marginTop: 16, fontWeight: 700 }}>Subtotal: ₹{subtotal}</div>
    </section>
  );
}
