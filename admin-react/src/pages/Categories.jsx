import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

const defaultForm = { name: '', slug: '', description: '', isActive: true };

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    const res = await api.getCategories();
    if (res?.success) setCats(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => { setModal(null); setEditId(null); setForm(defaultForm); };

  const handleSave = async () => {
    setSaving(true);
    const res = editId ? await api.updateCategory(editId, form) : await api.createCategory(form);
    setSaving(false);
    if (res?.success) { showToast(res.message, 'success'); closeModal(); load(); }
    else showToast(res?.message || 'Error', 'error');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    const res = await api.deleteCategory(id);
    if (res?.success) { showToast('Deleted', 'success'); load(); }
    else showToast(res?.message || 'Failed', 'error');
  };

  return (
    <div className="r-page">
      <div className="r-page-header">
        <h1 className="r-page-title">Categories</h1>
        <button className="r-btn r-btn-primary" onClick={() => { setForm(defaultForm); setModal('add'); }}>+ Add Category</button>
      </div>
      {loading ? <Spinner /> : (
        <div className="r-card">
          <div className="r-table-wrap">
            <table className="r-table">
              <thead><tr><th>Category</th><th>Slug</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {cats.length > 0 ? cats.map(c => (
                  <tr key={c._id}>
                    <td><span className="r-cell-name">{c.name}</span></td>
                    <td style={{ color: 'var(--r-text-muted)', fontSize: '0.78rem' }}>{c.slug}</td>
                    <td><span className={`r-badge ${c.isActive ? 'r-badge-green' : 'r-badge-red'}`}>{c.isActive ? 'Active' : 'Hidden'}</span></td>
                    <td>
                      <div className="r-actions">
                        <button className="r-btn r-btn-sm r-btn-secondary" onClick={() => { setForm({ name: c.name, slug: c.slug, description: c.description || '', isActive: c.isActive }); setEditId(c._id); setModal('edit'); }}>✏️ Edit</button>
                        <button className="r-btn r-btn-sm r-btn-danger" onClick={() => handleDelete(c._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" className="r-empty">No categories yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Modal isOpen={!!modal} onClose={closeModal} title={modal === 'add' ? 'Add Category' : 'Edit Category'}
        footer={<div className="r-modal-actions">
          <button className="r-btn r-btn-secondary" onClick={closeModal}>Cancel</button>
          <button className="r-btn r-btn-primary" onClick={handleSave} disabled={saving}>{saving ? <><span className="r-spin" /> Saving...</> : 'Save'}</button>
        </div>}
      >
        <div className="r-form-group"><label className="r-label">Name *</label><input type="text" className="r-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Traditional" required /></div>
        <div className="r-form-group"><label className="r-label">Slug *</label><input type="text" className="r-input" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="e.g. traditional" required /></div>
        <div className="r-form-group"><label className="r-label">Description</label><textarea className="r-input r-textarea" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
        {editId && <div className="r-form-group"><label className="r-label">Status</label><select className="r-input" value={form.isActive ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'true' }))}><option value="true">Active</option><option value="false">Hidden</option></select></div>}
      </Modal>
    </div>
  );
}
