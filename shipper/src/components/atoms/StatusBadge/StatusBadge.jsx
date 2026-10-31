export default function StatusBadge({ status = 'pending' }) {
  const map = {
    pending: { bg: '#fef3c7', color: '#92400e' },
    confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
    shipped: { bg: '#dcfce7', color: '#166534' },
    cancelled: { bg: '#fee2e2', color: '#991b1b' },
  };

  const value = status.toString().replace(/_/g, ' ');
  const styles = map[status] || { bg: '#e2e8f0', color: '#0f172a' };

  return <span style={{ background: styles.bg, color: styles.color, borderRadius: 999, padding: '0.3rem 0.65rem', fontSize: 12, fontWeight: 700 }}>{value}</span>;
}
