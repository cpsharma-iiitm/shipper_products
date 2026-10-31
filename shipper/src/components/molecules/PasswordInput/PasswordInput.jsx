export default function PasswordInput({ value, onChange, placeholder = 'Password' }) {
  return <input type="password" value={value} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '0.7rem 0.8rem' }} />;
}
