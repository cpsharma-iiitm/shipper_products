export default function Breadcrumbs({ items = [] }) {
  return (
    <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13, color: '#64748b' }}>
      {items.map((item, index) => (
        <span key={item + index}>
          {index ? <span> / </span> : null}
          <span>{item}</span>
        </span>
      ))}
    </nav>
  );
}
