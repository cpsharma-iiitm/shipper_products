export default function IconButton({ label, onClick, style = {} }) {
  return (
    <button type="button" onClick={onClick} style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', padding: '0.55rem 0.7rem', cursor: 'pointer', ...style }}>
      {label}
    </button>
  );
}
