export default function RatingStars({ value = 0, max = 5 }) {
  const stars = Array.from({ length: max }, (_, index) => index + 1);
  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {stars.map((star) => (
        <span key={star} style={{ color: star <= value ? '#fbbf24' : '#cbd5e1' }}>★</span>
      ))}
    </div>
  );
}
