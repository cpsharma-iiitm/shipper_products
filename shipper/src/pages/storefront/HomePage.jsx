import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section>
      <h1>Shipper storefront</h1>
      <p>Home, shop, checkout, order tracking and admin dashboard are all wired into the app skeleton.</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/shop">Explore shop</Link>
        <Link to="/login">Login</Link>
        <Link to="/checkout">Checkout</Link>
      </div>
    </section>
  );
}
