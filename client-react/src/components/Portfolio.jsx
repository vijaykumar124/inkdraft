import { useState } from 'react';

export default function Portfolio({ designs }) {
  const [selectedCat, setSelectedCat] = useState('All');
  const [lightboxImg, setLightboxImg] = useState(null);

  const defaultDesigns = [
    { title: 'Japanese Dragon Sleeve', category: 'Japanese', image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80' },
    { title: 'Fine Line Floral Spine', category: 'Fine Line', image: 'https://images.unsplash.com/photo-1568515045052-f7a8b4992b1c?w=600&q=80' },
    { title: 'Geometric Blackwork Compass', category: 'Geometric', image: 'https://images.unsplash.com/photo-1542359649-31e03cdde090?w=600&q=80' },
    { title: 'Realism Lion Portrait', category: 'Realism', image: 'https://images.unsplash.com/photo-1565402170291-834ae0795551?w=600&q=80' },
    { title: 'Neo-Traditional Skull & Rose', category: 'Neo-Traditional', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&q=80' },
    { title: 'Watercolor Phoenix Piece', category: 'Watercolor', image: 'https://images.unsplash.com/photo-1590246814884-570aafd05eac?w=600&q=80' }
  ];

  const list = designs && designs.length > 0 ? designs : defaultDesigns;
  const categories = ['All', ...new Set(list.map(d => d.category).filter(Boolean))];

  const filtered = selectedCat === 'All' ? list : list.filter(d => d.category === selectedCat);

  return (
    <section className="r-section" id="portfolio">
      <div className="r-container">
        <div className="r-section-header">
          <div className="r-subheading">PORTFOLIO & GALLERY</div>
          <h2 className="r-heading">Recent Works & Masterpieces</h2>
          <p className="r-desc">Browse authentic tattoos handcrafted by our resident artists.</p>

          {/* Filter Pills */}
          <div className="r-filter-pills">
            {categories.map(cat => (
              <button
                key={cat}
                className={`r-pill ${selectedCat === cat ? 'active' : ''}`}
                onClick={() => setSelectedCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="r-portfolio-grid">
          {filtered.map((item, idx) => (
            <div key={item._id || idx} className="r-portfolio-card" onClick={() => setLightboxImg(item)}>
              <img src={item.image} alt={item.title} className="r-port-img" />
              <div className="r-port-overlay">
                <div className="r-port-cat">{item.category}</div>
                <h3 className="r-port-title">{item.title}</h3>
                <div className="r-port-zoom">🔍 Click to Expand</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="r-lightbox-backdrop" onClick={() => setLightboxImg(null)}>
          <div className="r-lightbox-card" onClick={e => e.stopPropagation()}>
            <button className="r-lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
            <img src={lightboxImg.image} alt={lightboxImg.title} className="r-lightbox-img" />
            <div className="r-lightbox-info">
              <span className="r-lightbox-tag">{lightboxImg.category}</span>
              <h3>{lightboxImg.title}</h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
