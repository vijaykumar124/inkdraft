import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

const defaultForm = {
  title: '',
  category: 'Traditional',
  tags: '',
  isFeatured: true,
  isActive: true,
  imageUrl: ''
};

export default function Designs() {
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'add' | 'edit'
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const imageRef = useRef(null);
  const { showToast } = useToast();

  const load = async () => {
    const [dRes, cRes] = await Promise.all([
      api.getDesigns(),
      api.getCategories()
    ]);
    if (dRes?.success) setDesigns(dRes.data);
    if (cRes?.success) setCategories(cRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => { setModal(null); setEditId(null); setForm(defaultForm); };

  const handleSave = async () => {
    if (!form.title || !form.category) {
      showToast('Title and Category are required', 'error');
      return;
    }
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageRef.current?.files[0]) {
      fd.append('image', imageRef.current.files[0]);
    }

    const res = editId ? await api.updateDesign(editId, fd) : await api.createDesign(fd);
    setSaving(false);
    if (res?.success) {
      showToast(res.message || 'Saved', 'success');
      closeModal();
      load();
    } else {
      showToast(res?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this design?')) return;
    const res = await api.deleteDesign(id);
    if (res?.success) { showToast('Design deleted', 'success'); load(); }
    else showToast(res?.message || 'Delete failed', 'error');
  };

  const modalContent = (
    <>
      <div className="r-form-group">
        <label className="r-label">Design Title *</label>
        <input type="text" className="r-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Dragon Sleeve" />
      </div>
      <div className="r-form-group">
        <label className="r-label">Category *</label>
        <select className="r-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
          {categories.length > 0 ? categories.map(c => (
            <option key={c._id} value={c.name}>{c.name}</option>
          )) : (
            <>
              <option>Traditional</option><option>Neo-Traditional</option><option>Minimalist</option>
              <option>Geometric</option><option>Watercolor</option><option>Blackwork</option>
              <option>Realism</option><option>Japanese</option><option>Fine Line</option>
            </>
          )}
        </select>
      </div>
      <div className="r-form-group">
        <label className="r-label">Tags (comma separated)</label>
        <input type="text" className="r-input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. dragon, sleeve, color" />
      </div>
      <div className="r-form-group">
        <label className="r-label">Featured on Homepage</label>
        <select className="r-input" value={form.isFeatured ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.value === 'true' }))}>
          <option value="true">Yes — Show on homepage</option>
          <option value="false">No</option>
        </select>
      </div>
      {editId && (
        <div className="r-form-group">
          <label className="r-label">Status</label>
          <select className="r-input" value={form.isActive ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'true' }))}>
            <option value="true">Active</option>
            <option value="false">Hidden</option>
          </select>
        </div>
      )}
      <div className="r-form-group">
        <label className="r-label">Image File Upload</label>
        <input type="file" ref={imageRef} accept="image/*" className="r-input-file" />
      </div>
      <div className="r-form-group">
        <label className="r-label">OR Image URL (Paste URL directly)</label>
        <input type="url" className="r-input" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://images.unsplash.com/photo-..." />
      </div>
    </>
  );

  return (
    <div className="r-page">
      <div className="r-page-header">
        <div>
          <h1 className="r-page-title">Tattoo Designs</h1>
          <div className="r-page-sub">Manage portfolio and homepage featured designs</div>
        </div>
        <button className="r-btn r-btn-primary" onClick={() => { setForm(defaultForm); setModal('add'); }}>+ Add Design</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="r-card">
          <div className="r-table-wrap">
            <table className="r-table">
              <thead><tr><th>Design</th><th>Category</th><th>Tags</th><th>Featured</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {designs.length > 0 ? designs.map(d => (
                  <tr key={d._id}>
                    <td>
                      <div className="r-artist-cell">
                        <img src={d.image} alt={d.title} className="r-table-img" style={{ borderRadius: 4 }} onError={e => e.target.src = 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=200&q=80'} />
                        <span className="r-cell-name">{d.title}</span>
                      </div>
                    </td>
                    <td>{d.category}</td>
                    <td style={{ maxWidth: 140, fontSize: '0.75rem', color: 'var(--r-text-muted)' }}>{(d.tags || []).join(', ')}</td>
                    <td><span className={`r-badge ${d.isFeatured ? 'r-badge-gold' : 'r-badge-gray'}`}>{d.isFeatured ? '★ Featured' : 'No'}</span></td>
                    <td><span className={`r-badge ${d.isActive ? 'r-badge-green' : 'r-badge-red'}`}>{d.isActive ? 'Active' : 'Hidden'}</span></td>
                    <td>
                      <div className="r-actions">
                        <button className="r-btn r-btn-sm r-btn-secondary" onClick={() => { setForm({ title: d.title, category: d.category, tags: (d.tags || []).join(', '), isFeatured: d.isFeatured, isActive: d.isActive, imageUrl: d.image || '' }); setEditId(d._id); setModal('edit'); }}>✏️</button>
                        <button className="r-btn r-btn-sm r-btn-danger" onClick={() => handleDelete(d._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="6" className="r-empty">No designs yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!modal} onClose={closeModal} title={modal === 'add' ? 'Add New Design' : 'Edit Design'}
        footer={<div className="r-modal-actions">
          <button className="r-btn r-btn-secondary" onClick={closeModal}>Cancel</button>
          <button className="r-btn r-btn-primary" onClick={handleSave} disabled={saving}>{saving ? <><span className="r-spin" /> Saving...</> : (modal === 'add' ? 'Add Design' : 'Update Design')}</button>
        </div>}
      >{modalContent}</Modal>
    </div>
  );
}
