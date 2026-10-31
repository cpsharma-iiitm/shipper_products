export default function AddressSummary({ address = {} }) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.8rem 1rem' }}>
      <strong>{address.name || 'Address'}</strong>
      <div>{address.line1 || 'Street address'}</div>
      <div>{address.city || 'City'}, {address.state || 'State'} {address.pincode || ''}</div>
    </div>
  );
}
