export default function MockModeBanner({ enabled = true }) {
  if (!enabled) return null;
  return <div style={{ background: '#fef3c7', color: '#92400e', padding: '0.7rem 1rem', fontSize: 13, fontWeight: 700 }}>Mock mode enabled</div>;
}
