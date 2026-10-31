export default function Popover({ open = false, children, trigger }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}
      {open ? <div style={{ position: 'absolute', zIndex: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, minWidth: 180, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>{children}</div> : null}
    </div>
  );
}
