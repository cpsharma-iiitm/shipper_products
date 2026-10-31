export default function Button({ children, variant = 'primary', size = 'md', type = 'button', onClick, disabled = false, style = {} }) {
  const palette = {
    primary: { background: '#0f172a', color: '#fff' },
    secondary: { background: '#e2e8f0', color: '#0f172a' },
    ghost: { background: 'transparent', color: '#0f172a', border: '1px solid #cbd5e1' },
  };

  const sizes = {
    sm: { padding: '0.45rem 0.9rem', fontSize: 12 },
    md: { padding: '0.7rem 1.1rem', fontSize: 14 },
    lg: { padding: '0.9rem 1.4rem', fontSize: 15 },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ border: 'none', borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, ...palette[variant] || palette.primary, ...sizes[size] || sizes.md, ...style }}
    >
      {children}
    </button>
  );
}
