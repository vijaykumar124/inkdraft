import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

const STATUS_OPTS = ['pending','reviewing','quoted','confirmed','in-progress','completed','cancelled'];
const STATUS_COLORS = { pending:'#e8a53c', reviewing:'#4c8ecf', quoted:'#c9a84c', confirmed:'#4caf6e', 'in-progress':'#4c8ecf', completed:'#4caf6e', cancelled:'#e05c5c' };

export default function Orders() {
  const [data, setData] = useState({ orders: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', quotedPrice: '', adminNotes: '', appointmentDate: '' });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (filterStatus) params.status = filterStatus;
    const res = await api.getOrders(params);
    if (res?.success) setData(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, filterStatus]);

  const openOrder = async (id) => {
    const res = await api.getOrder(id);
    if (res?.success) {
      setSelectedOrder(res.data);
      setEditForm({ status: res.data.status, quotedPrice: res.data.quotedPrice || '', adminNotes: res.data.adminNotes || '', appointmentDate: res.data.appointmentDate ? res.data.appointmentDate.slice(0, 10) : '' });
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    const res = await api.updateOrder(selectedOrder._id, editForm);
    setSaving(false);
    if (res?.success) { showToast('Order updated', 'success'); setSelectedOrder(null); load(); }
    else showToast(res?.message || 'Failed', 'error');
  };

  return (
    <div className="r-page">
      <div className="r-page-header">
        <h1 className="r-page-title">Orders</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="r-input" style={{ width: 'auto' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="r-card">
          <div className="r-table-wrap">
            <table className="r-table">
              <thead><tr><th>Order #</th><th>Client</th><th>Style</th><th>Size</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {data.orders.length > 0 ? data.orders.map(o => (
                  <tr key={o._id}>
                    <td><code style={{ color: '#c9a84c', fontSize: '0.78rem' }}>{o.orderNumber}</code></td>
                    <td>
                      <div className="r-cell-name">{o.clientName}</div>
                      <div className="r-cell-sub">{o.clientEmail}</div>
                    </td>
                    <td>{o.tattooStyle}</td>
                    <td>{o.size}</td>
                    <td><span className="r-badge" style={{ background: (STATUS_COLORS[o.status] || '#888') + '22', color: STATUS_COLORS[o.status] || '#888' }}>{o.status}</span></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--r-text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td><button className="r-btn r-btn-sm r-btn-secondary" onClick={() => openOrder(o._id)}>View / Edit</button></td>
                  </tr>
                )) : <tr><td colSpan="7" className="r-empty">No orders found</td></tr>}
              </tbody>
            </table>
          </div>
          {data.pages > 1 && (
            <div className="r-pagination">
              <button className="r-btn r-btn-sm r-btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span>Page {page} of {data.pages}</span>
              <button className="r-btn r-btn-sm r-btn-secondary" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.orderNumber || ''}`} size="lg"
        footer={<div className="r-modal-actions">
          <button className="r-btn r-btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
          <button className="r-btn r-btn-primary" onClick={handleUpdate} disabled={saving}>{saving ? <><span className="r-spin" /> Saving...</> : 'Update Order'}</button>
        </div>}
      >
        {selectedOrder && (
          <>
            <div className="r-form-grid" style={{ marginBottom: 16 }}>
              {[['Client', selectedOrder.clientName], ['Email', selectedOrder.clientEmail], ['Phone', selectedOrder.clientPhone || 'N/A'], ['Budget', selectedOrder.budget || 'N/A'], ['Style', selectedOrder.tattooStyle], ['Placement', selectedOrder.placement], ['Size', selectedOrder.size]].map(([label, val]) => (
                <div key={label}><div className="r-label" style={{ marginBottom: 2 }}>{label}</div><div style={{ fontSize: '0.9rem' }}>{val}</div></div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}><div className="r-label" style={{ marginBottom: 4 }}>Description</div><div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{selectedOrder.description}</div></div>
            </div>
            <hr style={{ borderColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
            <div className="r-form-grid">
              <div className="r-form-group">
                <label className="r-label">Status</label>
                <select className="r-input" value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="r-form-group">
                <label className="r-label">Quoted Price</label>
                <input type="text" className="r-input" value={editForm.quotedPrice} onChange={e => setEditForm(p => ({ ...p, quotedPrice: e.target.value }))} placeholder="e.g. $500" />
              </div>
              <div className="r-form-group">
                <label className="r-label">Appointment Date</label>
                <input type="date" className="r-input" value={editForm.appointmentDate} onChange={e => setEditForm(p => ({ ...p, appointmentDate: e.target.value }))} />
              </div>
            </div>
            <div className="r-form-group">
              <label className="r-label">Admin Notes</label>
              <textarea className="r-input r-textarea" rows={3} value={editForm.adminNotes} onChange={e => setEditForm(p => ({ ...p, adminNotes: e.target.value }))} placeholder="Internal notes..." />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
