import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

const CATEGORIES = ['Traditional','Neo-Traditional','Minimalist','Geometric','Watercolor','Blackwork','Realism','Japanese','Tribal','Fine Line','Dotwork','Other'];
const defaultForm = { title: '', category: '', artist: '', tags: '', isFeatured: false, isActive: true };

export default function Designs() {
  const [designs, setDesigns] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const imageRef = useRef(null);
  const { showToast } = useToast();

  const load = async () => {
    const [dr, ar] = await Promise.all([api.getDesigns(), api.getArtists()]);
    if (dr?.success) setDesigns(dr.data);
    if (ar?.success) setArtists(ar.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const closeModal = () => { setModal(null); setEditId(null); setForm(defaultForm); if (imageRef.current) imageRef.current.value = ''; };

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageRef.current?.files[0]) fd.append('image', imageRef.current.files[0]);
    const res = modal === 'add' ? await api.createDesign(fd) : await api.updateDesign(editId, fd);
    setSaving(false);
    if (res?.success) { showToast(res.message, 'success'); closeModal(); load(); }
    else showToast(res?.message || 'Error', 'error');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this design?')) return;
    const res = await api.deleteDesign(id);
    if (res?.success) { showToast('Design deleted', 'success'); load(); }
    else showToast(res?.message || 'Failed', 'error');
  };

  const modalContent = (
    <>
      <div className="r-form-group">
        <label className="r-label">Design Title *</label>
        <input type="text" className="r-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Dragon Sleeve" required />
      </div>
      <div className="r-form-grid">
        <div className="r-form-group">
          <label className="r-label">Category *</label>
          <select className="r-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="r-form-group">
          <label className="r-label">Artist</label>
          <select className="r-input" value={form.artist} onChange={e => setForm(p => ({ ...p, artist: e.target.value }))}>
            <option value="">No specific artist</option>
            {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        </div>
      </div>
      <div className="r-form-group">
        <label className="r-label">Tags (comma separated)</label>
        <input type="text" className="r-input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. dragon, sleeve, color" />
      </div>
      <div className="r-form-group">
        <label className="r-label">Featured on Homepage</label>
        <select className="r-input" value={form.isFeatured ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.value === 'true' }))}>
          <option value="false">No</option>
          <option value="true">Yes — Show on homepage</option>
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
        <label className="r-label">Design Image {editId ? '(optional)' : '*'}</label>
        <input type="file" ref={imageRef} accept="image/*" className="r-input-file" />
      </div>
    </>
  );

  return (
    <div className="r-page">
      <div className="r-page-header">
        <h1 className="r-page-title">Designs</h1>
        <button className="r-btn r-btn-primary" onClick={() => { setForm(defaultForm); setModal('add'); }}>+ Add Design</button>
      </div>
      {loading ? <Spinner /> : (
        <div className="r-card">
          <div className="r-table-wrap">
            <table className="r-table">
              <thead><tr><th>Design</th><th>Category</th><th>Artist</th><th>Tags</th><th>Featured</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {designs.length > 0 ? designs.map(d => (
                  <tr key={d._id}>
                    <td>
                      <div className="r-artist-cell">
                        <img src={d.image} alt={d.title} className="r-table-img" style={{ borderRadius: 4 }} />
                        <span className="r-cell-name">{d.title}</span>
                      </div>
                    </td>
                    <td>{d.category}</td>
                    <td>{d.artist?.name || '—'}</td>
                    <td style={{ maxWidth: 120, fontSize: '0.75rem', color: 'var(--r-text-muted)' }}>{(d.tags || []).join(', ')}</td>
                    <td><span className={`r-badge ${d.isFeatured ? 'r-badge-gold' : 'r-badge-gray'}`}>{d.isFeatured ? '★ Featured' : 'No'}</span></td>
                    <td><span className={`r-badge ${d.isActive ? 'r-badge-green' : 'r-badge-red'}`}>{d.isActive ? 'Active' : 'Hidden'}</span></td>
                    <td>
                      <div className="r-actions">
                        <button className="r-btn r-btn-sm r-btn-secondary" onClick={() => { setForm({ title: d.title, category: d.category, artist: d.artist?._id || '', tags: (d.tags || []).join(', '), isFeatured: d.isFeatured, isActive: d.isActive }); setEditId(d._id); setModal('edit'); }}>✏️</button>
                        <button className="r-btn r-btn-sm r-btn-danger" onClick={() => handleDelete(d._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="7" className="r-empty">No designs yet</td></tr>}
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
