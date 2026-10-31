export default function DeliveryCheck({ serviceable = true }) {
  return (
    <div style={{ background: '#ecfdf5', color: '#166534', borderRadius: 12, padding: '0.8rem 1rem' }}>
      {serviceable ? 'Delivery available in your area' : 'Delivery unavailable for this address'}
    </div>
  );
}
