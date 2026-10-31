export default function AddressPickerModal({ open = false }) {
  if (!open) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem' }}>
      <h3>Select saved address</h3>
      <div>Home • Delhi</div>
      <div>Office • Bengaluru</div>
    </div>
  );
}
