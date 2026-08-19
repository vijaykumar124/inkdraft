import { useNavigate } from 'react-router-dom';

export default function Categories({ categories }) {
  const navigate = useNavigate();

  const defaults = [
    { name: 'Traditional', slug: 'traditional', description: 'Bold black outlines and vivid primary color palette.', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&q=80' },
    { name: 'Japanese (Irezumi)', slug: 'japanese', description: 'Dragons, koi, peonies and mythological imagery.', image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80' },
    { name: 'Fine Line & Minimalist', slug: 'fine-line', description: 'Delicate, razor-thin lines and subtle elegance.', image: 'https://images.unsplash.com/photo-1568515045052-f7a8b4992b1c?w=600&q=80' },
    { name: 'Blackwork & Tribal', slug: 'blackwork', description: 'Intricate patterns, heavy black shading, and geometry.', image: 'https://images.unsplash.com/photo-1542359649-31e03cdde090?w=600&q=80' },
    { name: 'Realism & Portraits', slug: 'realism', description: 'Photorealistic human, animal, and sculptural art.', image: 'https://images.unsplash.com/photo-1565402170291-834ae0795551?w=600&q=80' },
    { name: 'Neo-Traditional', slug: 'neo-traditional', description: 'Modern take on traditional art with rich textures.', image: 'https://images.unsplash.com/photo-1590246814884-570aafd05eac?w=600&q=80' }
  ];

  const displayList = categories && categories.length > 0 ? categories : defaults;

  const handleCategoryClick = (cat) => {
    const slug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    navigate(`/react/category/${slug}`);
  };

  return (
    <section className="r-section" id="categories">
      <div className="r-container">
        <div className="r-section-header">
          <div className="r-subheading">EXPLORE STYLES</div>
          <h2 className="r-heading">Mastered Tattoo Styles</h2>
          <p className="r-desc">From ancient Irezumi to contemporary fine-line minimalism, our studio masters every discipline. Click any style to explore the full gallery.</p>
        </div>

        <div className="r-categories-grid">
          {displayList.map((cat, i) => (
            <div
              key={cat._id || cat.name || i}
              className="r-category-card"
              onClick={() => handleCategoryClick(cat)}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleCategoryClick(cat)}
              aria-label={`View ${cat.name} gallery`}
            >
              <img
                src={cat.image || defaults[i % defaults.length].image}
                alt={cat.name}
                className="r-cat-img"
                loading="lazy"
              />
              <div className="r-cat-overlay"></div>
              <div className="r-cat-content">
                <h3 className="r-cat-title">{cat.name}</h3>
                <p className="r-cat-desc">{cat.description || 'Bespoke custom tattoo craftsmanship.'}</p>
                <div className="r-cat-cta">
                  <span>View Gallery</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
