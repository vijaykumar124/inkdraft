import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Spinner from '../components/Spinner';

const STATUS_COLORS = {
  pending: '#e8a53c',
  reviewing: '#4c8ecf',
  quoted: '#c9a84c',
  confirmed: '#4caf6e',
  'in-progress': '#4c8ecf',
  completed: '#4caf6e',
  cancelled: '#e05c5c',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(res => {
      if (res?.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  const stats = [
    { label: 'Total Orders', value: data?.totalOrders ?? 0, icon: '📋', color: '#c9a84c' },
    { label: 'Pending Orders', value: data?.pendingOrders ?? 0, icon: '⏳', color: '#e8a53c' },
    { label: 'Categories', value: data?.totalCategories ?? 0, icon: '📁', color: '#4c8ecf' },
    { label: 'Active Designs', value: data?.totalDesigns ?? 0, icon: '🎨', color: '#4caf6e' },
  ];

  return (
    <div className="r-page">
      <div className="r-page-header">
        <h1 className="r-page-title">Dashboard</h1>
        <div className="r-page-sub">Welcome back to InkDraft Admin</div>
      </div>

      {/* Stats Grid */}
      <div className="r-stats-grid">
        {stats.map(s => (
          <div key={s.label} className="r-stat-card">
            <div className="r-stat-icon" style={{ background: s.color + '22' }}>{s.icon}</div>
            <div className="r-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="r-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="r-card">
        <div className="r-card-header">
          <div className="r-card-title">Recent Orders</div>
          <a href="/admin/orders" className="r-btn r-btn-sm r-btn-secondary">View All</a>
        </div>
        <div className="r-table-wrap">
          <table className="r-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Client</th>
                <th>Style</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.length > 0 ? data.recentOrders.map(order => (
                <tr key={order._id}>
                  <td><code style={{ color: '#c9a84c', fontSize: '0.78rem' }}>{order.orderNumber}</code></td>
                  <td>{order.clientName}</td>
                  <td>{order.tattooStyle}</td>
                  <td>
                    <span className="r-badge" style={{ background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status] }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--r-text-muted)', fontSize: '0.78rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--r-text-muted)' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Chart */}
      {data?.ordersByStatus?.length > 0 && (
        <div className="r-card">
          <div className="r-card-header">
            <div className="r-card-title">Orders by Status</div>
          </div>
          <div className="r-status-list">
            {data.ordersByStatus.map(s => (
              <div key={s._id} className="r-status-item">
                <span className="r-badge" style={{ background: STATUS_COLORS[s._id] + '22', color: STATUS_COLORS[s._id] }}>{s._id}</span>
                <span className="r-status-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
