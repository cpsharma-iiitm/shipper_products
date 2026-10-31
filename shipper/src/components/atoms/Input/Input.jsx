export default function Input({ label, name, value, onChange, placeholder, type = 'text', style = {} }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 14, color: '#334155', ...style }}>
      {label ? <span>{label}</span> : null}
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '0.7rem 0.8rem', fontSize: 14 }}
      />
    </label>
  );
}
