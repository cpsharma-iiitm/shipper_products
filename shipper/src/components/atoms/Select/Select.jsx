export default function Select({ value, onChange, options = [], placeholder = 'Select', style = {} }) {
  return (
    <select value={value} onChange={onChange} style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '0.7rem 0.8rem', background: '#fff', ...style }}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value ?? option} value={option.value ?? option}>
          {option.label ?? option.value ?? option}
        </option>
      ))}
    </select>
  );
}
