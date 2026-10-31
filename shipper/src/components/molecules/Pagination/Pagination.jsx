export default function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button type="button" onClick={() => onPageChange?.(Math.max(1, page - 1))} disabled={page <= 1}>Prev</button>
      <span>{page} / {totalPages}</span>
      <button type="button" onClick={() => onPageChange?.(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next</button>
    </div>
  );
}
