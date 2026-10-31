export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
      <div>
        <h2 style={{ margin: 0 }}>{title}</h2>
        {subtitle ? <p style={{ margin: '0.4rem 0 0', color: '#64748b' }}>{subtitle}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
