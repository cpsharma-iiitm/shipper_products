export default function Skeleton({ width = '100%', height = 18, borderRadius = 8 }) {
  return (
    <div style={{ width, height, borderRadius, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'pulse 1.2s ease-in-out infinite' }} />
  );
}
