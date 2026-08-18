export default function Artists({ artists }) {
  const defaults = [
    { name: 'Vikram "Vex" Arya', specialty: 'Japanese Irezumi & Blackwork', experience: '12+ Years', rating: 4.9, instagram: 'vex.ink', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80' },
    { name: 'Elena Rostova', specialty: 'Fine Line & Micro Realism', experience: '8+ Years', rating: 5.0, instagram: 'elena.tattoo', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
    { name: 'Marcus Vance', specialty: 'Neo-Traditional & Portraits', experience: '10+ Years', rating: 4.9, instagram: 'marcusvance', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80' }
  ];

  const list = artists && artists.length > 0 ? artists : defaults;

  return (
    <section className="r-section" id="artists">
      <div className="r-container">
        <div className="r-section-header">
          <div className="r-subheading">RESIDENT MASTERS</div>
          <h2 className="r-heading">Meet Our Tattoo Artists</h2>
          <p className="r-desc">Award-winning resident artists specializing in distinct tattoo disciplines.</p>
        </div>

        <div className="r-artists-grid">
          {list.map((artist, i) => (
            <div key={artist._id || i} className="r-artist-card">
              <div className="r-artist-img-wrap">
                <img src={artist.image || defaults[i % defaults.length].image} alt={artist.name} className="r-artist-img" />
                <div className="r-artist-badge">★ {artist.rating || 5.0}</div>
              </div>
              <div className="r-artist-body">
                <h3 className="r-artist-name">{artist.name}</h3>
                <div className="r-artist-spec">{artist.specialty}</div>
                <div className="r-artist-exp">⏱ {artist.experience || '5+ Years'} Experience</div>
                {artist.instagram && (
                  <a href={`https://instagram.com/${artist.instagram}`} target="_blank" rel="noopener noreferrer" className="r-artist-insta">
                    📷 @{artist.instagram}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
