import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

export default function CategoryGallery() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [category, setCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef(null);

  const loadCategory = async () => {
    const cats = await api.getCategories();
    if (cats?.success) {
      const cat = cats.data.find(c => c._id === categoryId);
      setCategory(cat || null);
    }
  };

  const loadImages = async () => {
    const res = await api.getCategoryImages(categoryId);
    if (res?.success) setImages(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategory();
    loadImages();
  }, [categoryId]);

  const handleUpload = async () => {
    const files = fileRef.current?.files;
    const hasFiles = files && files.length > 0;
    const hasUrl = urlInput.trim();
    if (!hasFiles && !hasUrl) {
      showToast('Please select files or enter an image URL', 'error');
      return;
    }

    setUploading(true);
    const fd = new FormData();
    if (hasFiles) {
      Array.from(files).forEach((f) => fd.append('images', f));
    }
    if (hasUrl) fd.append('imageUrls', hasUrl.trim());
    if (titleInput.trim()) fd.append('title', titleInput.trim());

    const res = await api.uploadCategoryImages(categoryId, fd);
    setUploading(false);

    if (res?.success) {
      showToast(res.message || 'Uploaded!', 'success');
      setUrlInput('');
      setTitleInput('');
      if (fileRef.current) fileRef.current.value = '';
      loadImages();
    } else {
      showToast(res?.message || 'Upload failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;
    setDeleting(id);
    const res = await api.deleteCategoryImage(id);
    setDeleting(null);
    if (res?.success) {
      showToast('Image deleted', 'success');
      setImages(prev => prev.filter(img => img._id !== id));
    } else {
      showToast('Failed to delete', 'error');
    }
  };

  const lbImages = images;
  const openLightbox = (idx) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);
  const prevImg = () => setLightbox(i => (i - 1 + lbImages.length) % lbImages.length);
  const nextImg = () => setLightbox(i => (i + 1) % lbImages.length);

  return (
    <div className="r-page">
      {/* Header */}
      <div className="r-page-header">
        <div>
          <button
            className="r-btn r-btn-secondary r-btn-sm"
            style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => navigate('/admin/categories')}
          >
            ← Back to Categories
          </button>
          <h1 className="r-page-title">
            {category ? `🖼️ ${category.name} Gallery` : 'Category Gallery'}
          </h1>
          <div className="r-page-sub">
            {images.length} image{images.length !== 1 ? 's' : ''} • Upload unlimited images
          </div>
        </div>
      </div>

      {/* Upload Panel */}
      <div className="r-card" style={{ marginBottom: 24 }}>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, color: 'var(--r-text-primary)' }}>
            📤 Upload Images
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="r-form-group" style={{ margin: 0 }}>
              <label className="r-label">Upload Image Files (Multiple allowed)</label>
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                multiple
                className="r-input-file"
                style={{ width: '100%' }}
              />
            </div>
            <div className="r-form-group" style={{ margin: 0 }}>
              <label className="r-label">Or Paste Image URL</label>
              <input
                type="url"
                className="r-input"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="r-form-group" style={{ margin: 0, flex: 1 }}>
              <label className="r-label">Image Title / Caption (optional)</label>
              <input
                type="text"
                className="r-input"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                placeholder="e.g. Dragon sleeve design"
              />
            </div>
            <button
              className="r-btn r-btn-primary"
              style={{ height: 42, minWidth: 140 }}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? <><span className="r-spin" /> Uploading...</> : '📤 Upload'}
            </button>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {loading ? <Spinner /> : images.length === 0 ? (
        <div className="r-card">
          <div className="r-empty" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📷</div>
            <div style={{ color: 'var(--r-text-muted)', fontSize: '1rem' }}>
              No images yet. Upload the first one above!
            </div>
          </div>
        </div>
      ) : (
        <div className="cgal-admin-grid">
          {images.map((img, idx) => (
            <div key={img._id} className="cgal-admin-card">
              <div className="cgal-admin-img-wrap" onClick={() => openLightbox(idx)}>
                <img
                  src={img.image}
                  alt={img.title || 'Gallery image'}
                  className="cgal-admin-img"
                  onError={e => { e.target.src = 'https://via.placeholder.com/300x200?text=Image'; }}
                />
                <div className="cgal-admin-overlay">🔍 Preview</div>
              </div>
              {img.title && (
                <div className="cgal-admin-title">{img.title}</div>
              )}
              <button
                className="cgal-admin-delete-btn"
                onClick={() => handleDelete(img._id)}
                disabled={deleting === img._id}
                title="Delete image"
              >
                {deleting === img._id ? '⏳' : '🗑'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="cgal-lb-backdrop"
          onClick={e => { if (e.target === e.currentTarget) closeLightbox(); }}
        >
          <button className="cgal-lb-close" onClick={closeLightbox}>✕</button>
          <button className="cgal-lb-nav cgal-lb-prev" onClick={prevImg}>‹</button>
          <div className="cgal-lb-content">
            <img
              src={lbImages[lightbox]?.image}
              alt={lbImages[lightbox]?.title || ''}
              className="cgal-lb-img"
            />
            {lbImages[lightbox]?.title && (
              <div className="cgal-lb-caption">{lbImages[lightbox].title}</div>
            )}
            <div className="cgal-lb-counter">{lightbox + 1} / {lbImages.length}</div>
          </div>
          <button className="cgal-lb-nav cgal-lb-next" onClick={nextImg}>›</button>
        </div>
      )}
    </div>
  );
}
