export default function ErrorState({ message = 'Something went wrong' }) {
  return <div style={{ color: '#b91c1c', background: '#fef2f2', borderRadius: 12, padding: '0.8rem 1rem' }}>{message}</div>;
}
