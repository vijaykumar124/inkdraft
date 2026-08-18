import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

const defaultForm = { name: '', specialty: '', experience: '', bio: '', instagram: '', rating: 5, isActive: true };

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'add' | 'edit'
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const imageRef = useRef(null);
  const { showToast } = useToast();

  const load = async () => {
    const res = await api.getArtists();
    if (res?.success) setArtists(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(defaultForm); setModal('add'); };
  const openEdit = (a) => {
    setForm({ name: a.name, specialty: a.specialty, experience: a.experience || '', bio: a.bio || '', instagram: a.instagram || '', rating: a.rating, isActive: a.isActive });
    setEditId(a._id);
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditId(null); if (imageRef.current) imageRef.current.value = ''; };

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageRef.current?.files[0]) fd.append('image', imageRef.current.files[0]);
    const res = modal === 'add' ? await api.createArtist(fd) : await api.updateArtist(editId, fd);
    setSaving(false);
    if (res?.success) {
      showToast(res.message, 'success');
      closeModal();
      load();
    } else {
      showToast(res?.message || 'Error', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete artist "${name}"? This cannot be undone.`)) return;
    const res = await api.deleteArtist(id);
    if (res?.success) { showToast('Artist deleted', 'success'); load(); }
    else showToast(res?.message || 'Delete failed', 'error');
  };

  const field = (label, key, type = 'text', extra = {}) => (
    <div className="r-form-group">
      <label className="r-label">{label}</label>
      <input type={type} className="r-input" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} {...extra} />
    </div>
  );

  const modalContent = (
    <>
      <div className="r-form-grid">
        {field('Full Name *', 'name', 'text', { required: true, placeholder: 'Artist name' })}
        {field('Specialty *', 'specialty', 'text', { required: true, placeholder: 'e.g. Japanese, Fine Line' })}
        {field('Experience', 'experience', 'text', { placeholder: 'e.g. 5+ years' })}
        {field('Instagram Handle', 'instagram', 'text', { placeholder: '@handle' })}
        {field('Rating (1-5)', 'rating', 'number', { min: 1, max: 5, step: 0.1 })}
        {modal === 'edit' && (
          <div className="r-form-group">
            <label className="r-label">Status</label>
            <select className="r-input" value={form.isActive ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'true' }))}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        )}
      </div>
      <div className="r-form-group">
        <label className="r-label">Bio</label>
        <textarea className="r-input r-textarea" rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Artist bio..." />
      </div>
      <div className="r-form-group">
        <label className="r-label">Profile Photo {modal === 'edit' ? '(optional — leave blank to keep current)' : ''}</label>
        <input type="file" ref={imageRef} accept="image/*" className="r-input-file" />
      </div>
    </>
  );

  return (
    <div className="r-page">
      <div className="r-page-header">
        <h1 className="r-page-title">Artists</h1>
        <button className="r-btn r-btn-primary" onClick={openAdd}>+ Add Artist</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="r-card">
          <div className="r-table-wrap">
            <table className="r-table">
              <thead>
                <tr>
                  <th>Artist</th><th>Specialty</th><th>Experience</th><th>Rating</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {artists.length > 0 ? artists.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div className="r-artist-cell">
                        <img src={a.image} alt={a.name} className="r-table-img" onError={e => e.target.src = '/images/default-artist.jpg'} />
                        <div>
                          <div className="r-cell-name">{a.name}</div>
                          {a.instagram && <div className="r-cell-sub">@{a.instagram}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{a.specialty}</td>
                    <td>{a.experience || '—'}</td>
                    <td><span style={{ color: '#c9a84c' }}>★ {a.rating}</span></td>
                    <td><span className={`r-badge ${a.isActive ? 'r-badge-green' : 'r-badge-red'}`}>{a.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="r-actions">
                        <button className="r-btn r-btn-sm r-btn-secondary" onClick={() => openEdit(a)}>✏️ Edit</button>
                        <button className="r-btn r-btn-sm r-btn-danger" onClick={() => handleDelete(a._id, a.name)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="r-empty">No artists yet. Click "Add Artist" to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={modal === 'add'}
        onClose={closeModal}
        title="Add New Artist"
        footer={
          <div className="r-modal-actions">
            <button className="r-btn r-btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="r-btn r-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="r-spin" /> Saving...</> : 'Save Artist'}
            </button>
          </div>
        }
      >
        {modalContent}
      </Modal>

      <Modal
        isOpen={modal === 'edit'}
        onClose={closeModal}
        title="Edit Artist"
        footer={
          <div className="r-modal-actions">
            <button className="r-btn r-btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="r-btn r-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="r-spin" /> Updating...</> : 'Update Artist'}
            </button>
          </div>
        }
      >
        {modalContent}
      </Modal>
    </div>
  );
}
