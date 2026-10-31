export default function SelectField({ label, options = [], ...props }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {label ? <span style={{ fontSize: 14, color: '#334155' }}>{label}</span> : null}
      <select {...props} style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '0.7rem 0.8rem', background: '#fff' }}>
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option.value ?? option}</option>
        ))}
      </select>
    </div>
  );
}
