import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

const defaultForm = { name: '', price: '', period: 'session', description: '', features: '', isPopular: false, isActive: true, ctaText: 'Book Now' };

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    const res = await api.getPricing();
    if (res?.success) setPlans(res.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const closeModal = () => { setModal(null); setEditId(null); setForm(defaultForm); };
  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, features: form.features };
    const res = editId ? await api.updatePricing(editId, payload) : await api.createPricing(payload);
    setSaving(false);
    if (res?.success) { showToast(res.message, 'success'); closeModal(); load(); }
    else showToast(res?.message || 'Error', 'error');
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return;
    const res = await api.deletePricing(id);
    if (res?.success) { showToast('Deleted', 'success'); load(); }
  };

  const modalBody = (
    <div className="r-form-grid">
      <div className="r-form-group"><label className="r-label">Plan Name *</label><input className="r-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Starter" /></div>
      <div className="r-form-group"><label className="r-label">Price</label><input className="r-input" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. $150" /></div>
      <div className="r-form-group"><label className="r-label">Period</label><input className="r-input" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder="session" /></div>
      <div className="r-form-group"><label className="r-label">CTA Text</label><input className="r-input" value={form.ctaText} onChange={e => setForm(p => ({ ...p, ctaText: e.target.value }))} /></div>
      <div className="r-form-group"><label className="r-label">Popular</label><select className="r-input" value={form.isPopular ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isPopular: e.target.value === 'true' }))}><option value="false">No</option><option value="true">Yes</option></select></div>
      {editId && <div className="r-form-group"><label className="r-label">Active</label><select className="r-input" value={form.isActive ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'true' }))}><option value="true">Yes</option><option value="false">No</option></select></div>}
      <div className="r-form-group" style={{ gridColumn: '1 / -1' }}><label className="r-label">Description</label><input className="r-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
      <div className="r-form-group" style={{ gridColumn: '1 / -1' }}><label className="r-label">Features (one per line)</label><textarea className="r-input r-textarea" rows={5} value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} placeholder="Free consultation&#10;Up to 4 hours&#10;Touch-up included" /></div>
    </div>
  );

  return (
    <div className="r-page">
      <div className="r-page-header"><h1 className="r-page-title">Pricing Plans</h1><button className="r-btn r-btn-primary" onClick={() => { setForm(defaultForm); setModal('add'); }}>+ Add Plan</button></div>
      {loading ? <Spinner /> : (
        <div className="r-card">
          <div className="r-table-wrap">
            <table className="r-table">
              <thead><tr><th>Plan</th><th>Price</th><th>Popular</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {plans.length > 0 ? plans.map(p => (
                  <tr key={p._id}>
                    <td><div className="r-cell-name">{p.name}</div><div className="r-cell-sub">{p.description}</div></td>
                    <td style={{ color: '#c9a84c', fontWeight: 700 }}>{p.price}<span style={{ color: 'var(--r-text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>/{p.period}</span></td>
                    <td><span className={`r-badge ${p.isPopular ? 'r-badge-gold' : 'r-badge-gray'}`}>{p.isPopular ? '★ Popular' : 'No'}</span></td>
                    <td><span className={`r-badge ${p.isActive ? 'r-badge-green' : 'r-badge-red'}`}>{p.isActive ? 'Active' : 'Hidden'}</span></td>
                    <td><div className="r-actions">
                      <button className="r-btn r-btn-sm r-btn-secondary" onClick={() => { setForm({ name: p.name, price: p.price, period: p.period, description: p.description, features: (p.features || []).join('\n'), isPopular: p.isPopular, isActive: p.isActive, ctaText: p.ctaText || 'Book Now' }); setEditId(p._id); setModal('edit'); }}>✏️</button>
                      <button className="r-btn r-btn-sm r-btn-danger" onClick={() => handleDelete(p._id)}>🗑</button>
                    </div></td>
                  </tr>
                )) : <tr><td colSpan="5" className="r-empty">No pricing plans yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Modal isOpen={!!modal} onClose={closeModal} title={modal === 'add' ? 'Add Pricing Plan' : 'Edit Plan'}
        footer={<div className="r-modal-actions"><button className="r-btn r-btn-secondary" onClick={closeModal}>Cancel</button><button className="r-btn r-btn-primary" onClick={handleSave} disabled={saving}>{saving ? <><span className="r-spin" /> Saving...</> : 'Save'}</button></div>}
      >{modalBody}</Modal>
    </div>
  );
}
