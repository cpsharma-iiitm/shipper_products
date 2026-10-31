export default function ProductsTableCard({ rows = [] }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={{ textAlign: 'left', padding: '0.9rem 1rem' }}>Product</th>
            <th style={{ textAlign: 'left', padding: '0.9rem 1rem' }}>Category</th>
            <th style={{ textAlign: 'left', padding: '0.9rem 1rem' }}>Price</th>
            <th style={{ textAlign: 'left', padding: '0.9rem 1rem' }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td style={{ padding: '0.9rem 1rem', borderTop: '1px solid #e2e8f0' }}>{row.name}</td>
              <td style={{ padding: '0.9rem 1rem', borderTop: '1px solid #e2e8f0' }}>{row.category}</td>
              <td style={{ padding: '0.9rem 1rem', borderTop: '1px solid #e2e8f0' }}>₹{row.price}</td>
              <td style={{ padding: '0.9rem 1rem', borderTop: '1px solid #e2e8f0' }}>{row.stock ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
