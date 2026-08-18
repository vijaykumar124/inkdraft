import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

const defaultForm = { name: '', location: '', rating: 5, review: '', tattooStyle: '', isApproved: true, isFeatured: false };

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    const res = await api.getTestimonials();
    if (res?.success) setItems(res.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const closeModal = () => { setModal(null); setEditId(null); setForm(defaultForm); };
  const handleSave = async () => {
    setSaving(true);
    const res = editId ? await api.updateTestimonial(editId, form) : await api.createTestimonial(form);
    setSaving(false);
    if (res?.success) { showToast(res.message, 'success'); closeModal(); load(); }
    else showToast(res?.message || 'Error', 'error');
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    const res = await api.deleteTestimonial(id);
    if (res?.success) { showToast('Deleted', 'success'); load(); }
  };

  const modalBody = (
    <>
      <div className="r-form-grid">
        <div className="r-form-group"><label className="r-label">Name *</label><input className="r-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
        <div className="r-form-group"><label className="r-label">Location</label><input className="r-input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
        <div className="r-form-group"><label className="r-label">Rating (1-5)</label><input type="number" min={1} max={5} className="r-input" value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))} /></div>
        <div className="r-form-group"><label className="r-label">Tattoo Style</label><input className="r-input" value={form.tattooStyle} onChange={e => setForm(p => ({ ...p, tattooStyle: e.target.value }))} /></div>
        <div className="r-form-group"><label className="r-label">Approved</label><select className="r-input" value={form.isApproved ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isApproved: e.target.value === 'true' }))}><option value="true">Yes</option><option value="false">No</option></select></div>
        <div className="r-form-group"><label className="r-label">Featured</label><select className="r-input" value={form.isFeatured ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.value === 'true' }))}><option value="false">No</option><option value="true">Yes</option></select></div>
      </div>
      <div className="r-form-group"><label className="r-label">Review *</label><textarea className="r-input r-textarea" rows={4} value={form.review} onChange={e => setForm(p => ({ ...p, review: e.target.value }))} required /></div>
    </>
  );

  return (
    <div className="r-page">
      <div className="r-page-header"><h1 className="r-page-title">Testimonials</h1><button className="r-btn r-btn-primary" onClick={() => { setForm(defaultForm); setModal('add'); }}>+ Add</button></div>
      {loading ? <Spinner /> : (
        <div className="r-card">
          <div className="r-table-wrap">
            <table className="r-table">
              <thead><tr><th>Client</th><th>Rating</th><th>Style</th><th>Featured</th><th>Approved</th><th>Actions</th></tr></thead>
              <tbody>
                {items.length > 0 ? items.map(t => (
                  <tr key={t._id}>
                    <td><div className="r-cell-name">{t.name}</div><div className="r-cell-sub">{t.location}</div></td>
                    <td><span style={{ color: '#c9a84c' }}>★ {t.rating}</span></td>
                    <td>{t.tattooStyle}</td>
                    <td><span className={`r-badge ${t.isFeatured ? 'r-badge-gold' : 'r-badge-gray'}`}>{t.isFeatured ? 'Yes' : 'No'}</span></td>
                    <td><span className={`r-badge ${t.isApproved ? 'r-badge-green' : 'r-badge-red'}`}>{t.isApproved ? 'Yes' : 'No'}</span></td>
                    <td><div className="r-actions">
                      <button className="r-btn r-btn-sm r-btn-secondary" onClick={() => { setForm({ name: t.name, location: t.location || '', rating: t.rating, review: t.review, tattooStyle: t.tattooStyle || '', isApproved: t.isApproved, isFeatured: t.isFeatured }); setEditId(t._id); setModal('edit'); }}>✏️</button>
                      <button className="r-btn r-btn-sm r-btn-danger" onClick={() => handleDelete(t._id)}>🗑</button>
                    </div></td>
                  </tr>
                )) : <tr><td colSpan="6" className="r-empty">No testimonials yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Modal isOpen={!!modal} onClose={closeModal} title={modal === 'add' ? 'Add Testimonial' : 'Edit Testimonial'}
        footer={<div className="r-modal-actions"><button className="r-btn r-btn-secondary" onClick={closeModal}>Cancel</button><button className="r-btn r-btn-primary" onClick={handleSave} disabled={saving}>{saving ? <><span className="r-spin" /> Saving...</> : 'Save'}</button></div>}
      >{modalBody}</Modal>
    </div>
  );
}
