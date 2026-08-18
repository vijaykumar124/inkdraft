export default function Testimonials({ testimonials }) {
  const defaults = [
    { name: 'Rohan Mehta', location: 'Delhi', tattooStyle: 'Japanese Sleeve', rating: 5, review: 'Vex transformed my rough idea into a breathtaking Japanese dragon sleeve. The studio hygiene and artistic precision is unparalleled!' },
    { name: 'Ananya Sharma', location: 'Mumbai', tattooStyle: 'Fine Line Floral', rating: 5, review: 'Elena is a genius with fine lines! Super gentle experience and my tattoo healed absolutely crisp. Best studio in town!' },
    { name: 'Karan Malhotra', location: 'Bengaluru', tattooStyle: 'Geometric Blackwork', rating: 5, review: 'Worth every rupee. The custom draft process allowed me to tweak details until it was 100% perfect. Highly recommend InkDraft!' }
  ];

  const list = testimonials && testimonials.length > 0 ? testimonials : defaults;

  return (
    <section className="r-section r-bg-alt" id="testimonials">
      <div className="r-container">
        <div className="r-section-header">
          <div className="r-subheading">CLIENT REVIEWS</div>
          <h2 className="r-heading">Stories Written In Ink</h2>
          <p className="r-desc">Read honest feedback from our valued clients.</p>
        </div>

        <div className="r-testimonials-grid">
          {list.map((item, i) => (
            <div key={item._id || i} className="r-testimonial-card">
              <div className="r-test-stars">{'★'.repeat(item.rating || 5)}</div>
              <p className="r-test-text">"{item.review}"</p>
              <div className="r-test-footer">
                <div className="r-test-avatar">{item.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="r-test-name">{item.name}</div>
                  <div className="r-test-meta">{item.tattooStyle || 'Custom Tattoo'} • {item.location || 'Verified Client'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
