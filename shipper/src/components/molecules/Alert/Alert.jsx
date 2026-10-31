export default function Alert({ title, children, tone = 'info' }) {
  const colors = {
    info: { bg: '#eff6ff', color: '#1d4ed8' },
    success: { bg: '#ecfdf5', color: '#166534' },
    warning: { bg: '#fff7ed', color: '#9a5b00' },
    error: { bg: '#fef2f2', color: '#b91c1c' },
  };

  return (
    <div style={{ background: colors[tone]?.bg || colors.info.bg, color: colors[tone]?.color || colors.info.color, padding: '0.8rem 1rem', borderRadius: 12 }}>
      {title ? <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong> : null}
      {children}
    </div>
  );
}
