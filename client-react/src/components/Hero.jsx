export default function Hero({ settings }) {
  const heroBadge = settings?.heroBadge || 'APPOINTMENTS NOW OPEN';
  const heroTitle = settings?.heroTitle || 'Wear Your Story In Custom Ink';
  const heroSub = settings?.heroSubtitle || 'World-class tattoo artists crafting bespoke, timeless body art tailored to your skin.';
  const heroImage = settings?.heroImage || 'https://images.unsplash.com/photo-1604836454547-28b7a2317d0e?w=1200&q=80';
  const heroCta1 = settings?.heroCtaPrimary || 'Book Consultation';
  const heroCta2 = settings?.heroCtaSecondary || 'Explore Portfolio';

  const stat1Num = settings?.stat1Num || '5,000+';
  const stat1Lbl = settings?.stat1Lbl || 'Custom Tattoos Ink\'d';
  const stat2Num = settings?.stat2Num || '4.9 ★';
  const stat2Lbl = settings?.stat2Lbl || 'Client Rating';
  const stat3Num = settings?.stat3Num || '10+ Yrs';
  const stat3Lbl = settings?.stat3Lbl || 'Master Experience';

  return (
    <section className="r-hero" id="hero">
      <div className="r-container r-hero-grid">
        {/* Left Column: Content */}
        <div className="r-hero-content">
          <div className="r-hero-badge">
            <span className="r-badge-dot">●</span> {heroBadge}
          </div>
          <h1 className="r-hero-title">{heroTitle}</h1>
          <p className="r-hero-sub">{heroSub}</p>

          <div className="r-hero-actions">
            <a href="#order-form" className="r-btn-main">
              <span>{heroCta1}</span>
              <span>→</span>
            </a>
            <a href="#portfolio" className="r-btn-outline">
              {heroCta2}
            </a>
          </div>

          <div className="r-hero-stats">
            <div>
              <div className="r-stat-num">{stat1Num}</div>
              <div className="r-stat-lbl">{stat1Lbl}</div>
            </div>
            <div className="r-stat-divider"></div>
            <div>
              <div className="r-stat-num">{stat2Num}</div>
              <div className="r-stat-lbl">{stat2Lbl}</div>
            </div>
            <div className="r-stat-divider"></div>
            <div>
              <div className="r-stat-num">{stat3Num}</div>
              <div className="r-stat-lbl">{stat3Lbl}</div>
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
