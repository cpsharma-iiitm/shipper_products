export default function Avatar({ src, alt = 'avatar', size = 40, fallback = 'S' }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', display: 'grid', placeItems: 'center', background: '#e2e8f0', color: '#0f172a', fontSize: 12, fontWeight: 700 }}>
      {src ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : fallback}
    </div>
  );
}
