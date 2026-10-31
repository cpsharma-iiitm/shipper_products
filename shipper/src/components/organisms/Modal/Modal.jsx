export default function Modal({ open = false, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.35)', display: 'grid', placeItems: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 18, minWidth: 320, maxWidth: 640, padding: '1rem 1.2rem', boxShadow: '0 16px 40px rgba(15,23,42,0.18)' }} onClick={(e) => e.stopPropagation()}>
        {title ? <div style={{ fontWeight: 800, marginBottom: 12 }}>{title}</div> : null}
        {children}
      </div>
    </div>
  );
}
