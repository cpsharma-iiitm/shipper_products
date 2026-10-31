export default function Card({ children, title, subtitle, style = {} }) {
  return (
    <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem 1.1rem', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)', ...style }}>
      {title || subtitle ? (
        <div style={{ marginBottom: 12 }}>
          {title ? <div style={{ fontWeight: 700, marginBottom: subtitle ? 4 : 0 }}>{title}</div> : null}
          {subtitle ? <div style={{ fontSize: 13, color: '#475569' }}>{subtitle}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
