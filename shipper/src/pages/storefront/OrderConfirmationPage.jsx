export default function OrderConfirmationPage() {
  return (
    <section style={{ padding: '2rem 0' }}>
      <h2>Order placed successfully</h2>
      <p>Your order is confirmed and the delivery timeline has been shared.</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <a href="/orders">View orders</a>
        <a href="/track">Track shipment</a>
      </div>
    </section>
  );
}
