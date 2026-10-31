export default function FilterChip({ label, active = false, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ padding: '0.45rem 0.8rem', borderRadius: 999, border: `1px solid ${active ? '#0f172a' : '#cbd5e1'}`, background: active ? '#0f172a' : '#fff', color: active ? '#fff' : '#0f172a', cursor: 'pointer' }}>
      {label}
    </button>
  );
}
