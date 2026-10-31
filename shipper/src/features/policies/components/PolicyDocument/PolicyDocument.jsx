export default function PolicyDocument({ title = 'Policy', content = 'This policy applies to all customer and admin interactions.' }) {
  return (
    <article style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ color: '#475569', lineHeight: 1.7, margin: 0 }}>{content}</p>
    </article>
  );
}
