export default function TrackShipment({ shipment = {} }) {
  return (
    <section>
      <h2>Track shipment</h2>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem' }}>
        <strong>{shipment.id || 'Tracking ID'}</strong>
        <div>Status: {shipment.status || 'In transit'}</div>
        <div>ETA: {shipment.eta || 'Tomorrow'}</div>
      </div>
    </section>
  );
}
