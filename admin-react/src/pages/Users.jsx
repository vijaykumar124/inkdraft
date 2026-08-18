import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const load = async () => {
    const res = await api.getUsers();
    if (res?.success) setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const res = await api.updateUser(id, { isActive: !currentStatus });
    if (res?.success) {
      showToast(`User ${!currentStatus ? 'activated' : 'blocked'}`, 'success');
      load();
    } else {
      showToast(res?.message || 'Failed to update user', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    const res = await api.deleteUser(id);
    if (res?.success) {
      showToast('User deleted', 'success');
      load();
    } else {
      showToast(res?.message || 'Delete failed', 'error');
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="r-page">
      <div className="r-page-header">
        <div>
          <h1 className="r-page-title">Registered Users</h1>
          <div className="r-page-sub">Manage client accounts and status</div>
        </div>
        <input
          type="text"
          className="r-input"
          style={{ width: 260 }}
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <Spinner /> : (
        <div className="r-card">
          <div className="r-table-wrap">
            <table className="r-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="r-artist-cell">
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--r-gold), #a6852f)',
                          color: '#000', fontWeight: 700, fontSize: '0.9rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="r-cell-name">{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--r-text-muted)', fontSize: '0.82rem' }}>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td style={{ color: 'var(--r-text-muted)', fontSize: '0.78rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`r-badge ${u.isActive ? 'r-badge-green' : 'r-badge-red'}`}>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td>
                      <div className="r-actions">
                        <button
                          className={`r-btn r-btn-sm ${u.isActive ? 'r-btn-danger' : 'r-btn-secondary'}`}
                          onClick={() => handleToggleStatus(u._id, u.isActive)}
                        >
                          {u.isActive ? 'Block' : 'Unblock'}
                        </button>
                        <button
                          className="r-btn r-btn-sm r-btn-danger"
                          onClick={() => handleDelete(u._id, u.name)}
                          title="Delete User"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="r-empty">No registered users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
