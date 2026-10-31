export default function Logo({ text = 'Shipper', size = 24 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: size, color: '#0f172a' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0f172a', display: 'inline-block' }} />
      {text}
    </div>
  );
}
