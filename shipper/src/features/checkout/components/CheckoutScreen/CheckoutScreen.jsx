export default function CheckoutScreen({ order = {} }) {
  return (
    <section>
      <h2>Checkout</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem' }}>Delivery address</div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem' }}>Payment method</div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem' }}>Order summary: {order.total || 0}</div>
      </div>
    </section>
  );
}
