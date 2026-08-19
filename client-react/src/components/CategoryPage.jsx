import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'slider'
  const [lightbox, setLightbox] = useState(null); // index or null
  const [sliderIdx, setSliderIdx] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/public/category/${slug}`)
      .then(r => r.json())
      .then(res => {
        if (res?.success) {
          setCategory(res.data.category);
          setImages(res.data.images || []);
          setSliderIdx(0);
        } else {
          setError(res?.message || 'Category not found');
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load gallery'); setLoading(false); });
  }, [slug]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (lightbox !== null) {
        if (e.key === 'ArrowLeft') setLightbox(i => (i - 1 + images.length) % images.length);
        if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % images.length);
        if (e.key === 'Escape') setLightbox(null);
      } else if (viewMode === 'slider') {
        if (e.key === 'ArrowLeft') setSliderIdx(i => (i - 1 + images.length) % images.length);
        if (e.key === 'ArrowRight') setSliderIdx(i => (i + 1) % images.length);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, images.length, viewMode]);

  const openLightbox = (idx) => { setLightbox(idx); document.body.style.overflow = 'hidden'; };
  const closeLightbox = () => { setLightbox(null); document.body.style.overflow = ''; };
  const lbPrev = () => setLightbox(i => (i - 1 + images.length) % images.length);
  const lbNext = () => setLightbox(i => (i + 1) % images.length);
  const sliderPrev = () => setSliderIdx(i => (i - 1 + images.length) % images.length);
  const sliderNext = () => setSliderIdx(i => (i + 1) % images.length);

  // Touch swipe for slider
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? sliderNext() : sliderPrev();
    touchStartX.current = null;
  };

  const getSliderStyle = (idx) => {
    const total = images.length;
    let offset = idx - sliderIdx;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    const absOffset = Math.abs(offset);
    const isActive = offset === 0;
    const isVisible = absOffset <= 2;
    if (!isVisible) return { display: 'none' };
    const scale = isActive ? 1 : absOffset === 1 ? 0.78 : 0.6;
    const translateX = offset * 65;
    const opacity = isActive ? 1 : absOffset === 1 ? 0.65 : 0.35;
    const zIndex = 10 - absOffset;
    const filter = isActive ? 'none' : `grayscale(${absOffset * 40}%) brightness(0.7)`;
    return {
      transform: `translateX(${translateX}%) scale(${scale})`,
      opacity,
      zIndex,
      filter,
      cursor: isActive ? 'pointer' : 'pointer',
    };
  };

  if (loading) return (
    <div className="cgal-page">
      <div className="cgal-loading">
        <div className="cgal-spinner" />
        <div>Loading gallery...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="cgal-page">
      <div className="cgal-error">
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
        <div>{error}</div>
        <button className="cgal-back-btn" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </div>
  );

  const fallbackImages = images.length === 0;

  return (
    <div className="cgal-page">
      {/* Page Header */}
      <div className="cgal-header">
        <button className="cgal-back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <div className="cgal-header-content">
          <h1 className="cgal-title">{category?.name}</h1>
          {category?.description && <p className="cgal-desc">{category.description}</p>}
          <div className="cgal-meta">{images.length} artwork{images.length !== 1 ? 's' : ''}</div>
        </div>
        {/* View Toggle */}
        <div className="cgal-view-toggle">
          <button
            className={`cgal-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Grid
          </button>
          <button
            className={`cgal-toggle-btn ${viewMode === 'slider' ? 'active' : ''}`}
            onClick={() => setViewMode('slider')}
            title="Slider View"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M8 2l-4 4 4 4"/><path d="M16 2l4 4-4 4"/>
            </svg>
            Slider
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {fallbackImages && (
        <div className="cgal-empty">
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🖼️</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No images yet</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Images uploaded in admin will appear here.</div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && !fallbackImages && (
        <div className="cgal-masonry">
          {images.map((img, idx) => (
            <div
              key={img._id}
              className="cgal-masonry-item"
              onClick={() => openLightbox(idx)}
            >
              <img
                src={img.image}
                alt={img.title || category?.name}
                className="cgal-masonry-img"
                loading="lazy"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80'; }}
              />
              <div className="cgal-masonry-overlay">
                <div className="cgal-masonry-icon">⊕</div>
                {img.title && <div className="cgal-masonry-caption">{img.title}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SLIDER VIEW */}
      {viewMode === 'slider' && !fallbackImages && (
        <div
          className="cgal-slider-wrap"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="cgal-slider-track">
            {images.map((img, idx) => (
              <div
                key={img._id}
                className={`cgal-slide ${idx === sliderIdx ? 'active' : ''}`}
                style={getSliderStyle(idx)}
                onClick={() => {
                  if (idx === sliderIdx) openLightbox(idx);
                  else setSliderIdx(idx);
                }}
              >
                <img
                  src={img.image}
                  alt={img.title || category?.name}
                  className="cgal-slide-img"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80'; }}
                />
                {idx === sliderIdx && img.title && (
                  <div className="cgal-slide-caption">{img.title}</div>
                )}
              </div>
            ))}
          </div>
          <button className="cgal-slider-nav cgal-slider-prev" onClick={sliderPrev} aria-label="Previous">‹</button>
          <button className="cgal-slider-nav cgal-slider-next" onClick={sliderNext} aria-label="Next">›</button>
          <div className="cgal-slider-dots">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`cgal-slider-dot ${idx === sliderIdx ? 'active' : ''}`}
                onClick={() => setSliderIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <div className="cgal-slider-counter">{sliderIdx + 1} / {images.length}</div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightbox !== null && (
        <div
          className="cgal-lb-backdrop"
          onClick={e => { if (e.target === e.currentTarget) closeLightbox(); }}
        >
          <button className="cgal-lb-close" onClick={closeLightbox} aria-label="Close">✕</button>
          <button className="cgal-lb-prev" onClick={lbPrev} aria-label="Previous">‹</button>

          <div className="cgal-lb-main">
            <img
              key={lightbox}
              src={images[lightbox]?.image}
              alt={images[lightbox]?.title || ''}
              className="cgal-lb-img"
            />
            {images[lightbox]?.title && (
              <div className="cgal-lb-caption">{images[lightbox].title}</div>
            )}
            <div className="cgal-lb-counter">{lightbox + 1} / {images.length}</div>
          </div>

          <button className="cgal-lb-next" onClick={lbNext} aria-label="Next">›</button>

          {/* Thumbnail strip */}
          <div className="cgal-lb-strip">
            {images.map((img, idx) => (
              <div
                key={img._id}
                className={`cgal-lb-thumb ${idx === lightbox ? 'active' : ''}`}
                onClick={() => setLightbox(idx)}
              >
                <img
                  src={img.image}
                  alt=""
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=100&q=60'; }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
