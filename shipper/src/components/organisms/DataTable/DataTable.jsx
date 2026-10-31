export default function DataTable({ columns = [], rows = [] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key || column.label} style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((column) => (
                <td key={column.key || column.label} style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
