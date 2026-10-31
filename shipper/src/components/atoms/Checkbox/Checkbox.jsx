export default function Checkbox({ checked = false, label, onChange }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label ? <span>{label}</span> : null}
    </label>
  );
}
