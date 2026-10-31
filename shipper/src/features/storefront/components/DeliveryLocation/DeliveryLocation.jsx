export default function DeliveryLocation({ city = 'Delhi' }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.9rem 1rem' }}>
      Delivering to: <strong>{city}</strong>
    </div>
  );
}
