export default function Drawer({ open = false, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.35)', zIndex: 1000 }} onClick={onClose}>
      <aside style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: 420, background: '#fff', padding: '1rem', boxShadow: '-12px 0 30px rgba(15,23,42,0.1)' }} onClick={(e) => e.stopPropagation()}>
        {title ? <div style={{ fontWeight: 800, marginBottom: 12 }}>{title}</div> : null}
        {children}
      </aside>
    </div>
  );
}
