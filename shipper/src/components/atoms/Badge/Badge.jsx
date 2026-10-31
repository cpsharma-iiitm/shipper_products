export default function Badge({ children, tone = 'neutral', style = {} }) {
  const toneMap = {
    neutral: { background: '#e2e8f0', color: '#0f172a' },
    success: { background: '#dcfce7', color: '#166534' },
    warning: { background: '#fef3c7', color: '#92400e' },
    error: { background: '#fee2e2', color: '#991b1b' },
    info: { background: '#dbeafe', color: '#1d4ed8' },
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '0.35rem 0.6rem', fontSize: 12, fontWeight: 700, ...toneMap[tone] || toneMap.neutral, ...style }}>
      {children}
    </span>
  );
}
