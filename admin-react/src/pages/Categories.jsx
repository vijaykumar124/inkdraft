import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

const defaultForm = { name: '', slug: '', description: '', isActive: true, imageUrl: '' };

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const imageRef = useRef(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const load = async () => {
    const res = await api.getCategories();
    if (res?.success) setCats(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => { setModal(null); setEditId(null); setForm(defaultForm); };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      showToast('Name and Slug are required', 'error');
      return;
    }
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageRef.current?.files[0]) {
      fd.append('image', imageRef.current.files[0]);
    }

    const res = editId ? await api.updateCategory(editId, fd) : await api.createCategory(fd);
    setSaving(false);
    if (res?.success) {
      showToast(res.message || 'Category saved', 'success');
      closeModal();
      load();
    } else {
      showToast(res?.message || 'Failed to save category', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    const res = await api.deleteCategory(id);
    if (res?.success) { showToast('Category deleted', 'success'); load(); }
    else showToast(res?.message || 'Failed to delete', 'error');
  };

  return (
    <div className="r-page">
      <div className="r-page-header">
        <div>
          <h1 className="r-page-title">Categories & Tattoo Styles</h1>
          <div className="r-page-sub">Manage tattoo categories, descriptions and cover images</div>
        </div>
        <button className="r-btn r-btn-primary" onClick={() => { setForm(defaultForm); setModal('add'); }}>+ Add Category</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="r-card">
          <div className="r-table-wrap">
            <table className="r-table">
              <thead><tr><th>Category Image & Name</th><th>Slug</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {cats.length > 0 ? cats.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div className="r-artist-cell">
                        <img
                          src={c.image || 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=200&q=80'}
                          alt={c.name}
                          className="r-table-img"
                          style={{ borderRadius: 6, width: 44, height: 44, objectFit: 'cover' }}
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=200&q=80'}
                        />
                        <span className="r-cell-name">{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--r-text-muted)', fontSize: '0.78rem' }}>{c.slug}</td>
                    <td style={{ color: 'var(--r-text-secondary)', fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description || '—'}</td>
                    <td><span className={`r-badge ${c.isActive !== false ? 'r-badge-green' : 'r-badge-red'}`}>{c.isActive !== false ? 'Active' : 'Hidden'}</span></td>
                    <td>
                      <div className="r-actions">
                        <button
                          className="r-btn r-btn-sm"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none' }}
                          onClick={() => navigate(`/admin/category-gallery/${c._id}`)}
                        >🖼️ Images</button>
                        <button className="r-btn r-btn-sm r-btn-secondary" onClick={() => {
                          setForm({
                            name: c.name,
                            slug: c.slug,
                            description: c.description || '',
                            isActive: c.isActive !== false,
                            imageUrl: c.image || ''
                          });
                          setEditId(c._id);
                          setModal('edit');
                        }}>✏️ Edit</button>
                        <button className="r-btn r-btn-sm r-btn-danger" onClick={() => handleDelete(c._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="5" className="r-empty">No categories yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!modal} onClose={closeModal} title={modal === 'add' ? 'Add Category' : 'Edit Category'}
        footer={<div className="r-modal-actions">
          <button className="r-btn r-btn-secondary" onClick={closeModal}>Cancel</button>
          <button className="r-btn r-btn-primary" onClick={handleSave} disabled={saving}>{saving ? <><span className="r-spin" /> Saving...</> : (modal === 'add' ? 'Add Category' : 'Update Category')}</button>
        </div>}
      >
        <div className="r-form-group">
          <label className="r-label">Category Name *</label>
          <input
            type="text"
            className="r-input"
            value={form.name}
            onChange={e => setForm(p => ({
              ...p,
              name: e.target.value,
              slug: modal === 'add' ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') : p.slug
            }))}
            placeholder="e.g. Traditional"
            required
          />
        </div>
        <div className="r-form-group">
          <label className="r-label">Slug *</label>
          <input type="text" className="r-input" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="e.g. traditional" required />
        </div>
        <div className="r-form-group">
          <label className="r-label">Description</label>
          <textarea className="r-input r-textarea" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this tattoo style..." />
        </div>

        <div className="r-form-group">
          <label className="r-label">Category Image File Upload</label>
          <input type="file" ref={imageRef} accept="image/*" className="r-input-file" />
        </div>

        <div className="r-form-group">
          <label className="r-label">OR Image URL (Paste direct image link)</label>
          <input type="url" className="r-input" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://images.unsplash.com/photo-..." />
        </div>

        <div className="r-form-group">
          <label className="r-label">Status</label>
          <select className="r-input" value={form.isActive ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'true' }))}>
            <option value="true">Active (Visible on Website)</option>
            <option value="false">Hidden</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
