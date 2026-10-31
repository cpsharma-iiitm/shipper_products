export default function FormField({ label, children, error }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 14, color: '#334155' }}>
      {label ? <span>{label}</span> : null}
      {children}
      {error ? <small style={{ color: '#b91c1c' }}>{error}</small> : null}
    </label>
  );
}
