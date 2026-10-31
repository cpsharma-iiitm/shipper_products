export default function TrackingResult({ shipment = {} }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18 }}>
      <div style={{ color: '#64748b', fontSize: 13 }}>Shipment</div>
      <h3 style={{ margin: '0.5rem 0' }}>{shipment.id || 'SHP-1001'}</h3>
      <div>Status: {shipment.status || 'In transit'}</div>
      <div>ETA: {shipment.eta || 'Tomorrow'}</div>
    </div>
  );
}
