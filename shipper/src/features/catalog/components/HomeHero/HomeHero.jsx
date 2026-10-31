export default function HomeHero() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', borderRadius: 20, padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ maxWidth: 700 }}>
        <div style={{ letterSpacing: 2, fontSize: 12, textTransform: 'uppercase', opacity: 0.8 }}>Shipper commerce</div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', margin: '0.5rem 0 1rem' }}>Launch faster. Fulfill smarter.</h1>
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, opacity: 0.9 }}>
          Manage storefront, admin operations, orders, tracking, inventory, reports, and customer lifecycle from one workflow.
        </p>
      </div>
    </section>
  );
}
