export default function Radio({ checked = false, label, name, onChange }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      {label ? <span>{label}</span> : null}
    </label>
  );
}
