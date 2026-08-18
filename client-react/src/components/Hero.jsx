export default function Hero({ settings }) {
  const heroImage = settings?.heroImage || 'https://images.unsplash.com/photo-1604836454547-28b7a2317d0e?w=1200&q=80';
  const heroTitle = settings?.heroTitle || 'Wear Your Story In Custom Ink';
  const heroSub = settings?.heroSubtitle || 'World-class tattoo artists crafting bespoke, timeless body art tailored to your skin.';

  return (
    <section className="r-hero" id="hero">
      <div className="r-container r-hero-grid">
        {/* Left Column: Content */}
        <div className="r-hero-content">
          <div className="r-hero-badge">
            <span className="r-badge-dot">●</span> APPOINTMENTS NOW OPEN
          </div>
          <h1 className="r-hero-title">{heroTitle}</h1>
          <p className="r-hero-sub">{heroSub}</p>

          <div className="r-hero-actions">
            <a href="#order-form" className="r-btn-main">
              <span>Book Consultation</span>
              <span>→</span>
            </a>
            <a href="#portfolio" className="r-btn-outline">
              Explore Portfolio
            </a>
          </div>

          <div className="r-hero-stats">
            <div>
              <div className="r-stat-num">5,000+</div>
              <div className="r-stat-lbl">Custom Tattoos Ink'd</div>
            </div>
            <div className="r-stat-divider"></div>
            <div>
              <div className="r-stat-num">4.9 ★</div>
              <div className="r-stat-lbl">Client Rating</div>
            </div>
            <div className="r-stat-divider"></div>
            <div>
              <div className="r-stat-num">10+ Yrs</div>
              <div className="r-stat-lbl">Master Experience</div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Image */}
        <div className="r-hero-visual">
          <div className="r-visual-glow"></div>
          <div className="r-visual-frame">
            <img
              src={heroImage}
              alt="Master Tattoo Artist InkDraft Studio"
              className="r-hero-img"
              onError={e => e.target.src = 'https://images.unsplash.com/photo-1604836454547-28b7a2317d0e?w=1200&q=80'}
            />
            <div className="r-visual-overlay"></div>
            <div className="r-visual-tag">
              <div className="r-tag-icon">🖋</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Bespoke Tattoo Designs</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>Created by Master Tattoo Artists</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
