export default function UsersList({ users = [] }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {users.map((user) => (
        <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.8rem 1rem' }}>
          <div>
            <strong>{user.name}</strong>
            <div style={{ color: '#64748b', fontSize: 13 }}>{user.email}</div>
          </div>
          <span>{user.role}</span>
        </div>
      ))}
    </div>
  );
}
