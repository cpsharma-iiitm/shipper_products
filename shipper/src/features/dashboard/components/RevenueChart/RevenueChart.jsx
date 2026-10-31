export default function RevenueChart({ points = [24, 30, 28, 38, 42, 50] }) {
  const height = 140;
  const width = 420;
  const max = Math.max(...points, 1);
  const polyline = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - (point / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem', overflow: 'hidden' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline fill="none" stroke="#0f172a" strokeWidth="3" points={polyline} />
      </svg>
    </div>
  );
}
