export default function Thumbnail({ src, alt = 'thumbnail', size = 72, style = {} }) {
  return (
    <div style={{ width: size, height: size, overflow: 'hidden', borderRadius: 12, background: '#f1f5f9', display: 'grid', placeItems: 'center', ...style }}>
      {src ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'IMG'}
    </div>
  );
}
