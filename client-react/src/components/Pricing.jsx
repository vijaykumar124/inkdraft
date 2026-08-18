export default function Pricing({ plans }) {
  const defaults = [
    { name: 'Minimalist & Fine Line', price: '₹3,499', period: 'starting', description: 'Ideal for small flash, fine-line, scripts, or single session pieces.', features: ['1-on-1 Artist Consultation', 'Single Session (Up to 2 Hrs)', 'Custom Digital Draft', 'Medical Aftercare Kit', '1 Free Touch-Up Session'], isPopular: false, ctaText: 'Book Minimalist' },
    { name: 'Custom Studio Piece', price: '₹8,999', period: 'session', description: 'Our most popular session for medium forearm, calf, or shoulder tattoos.', features: ['Priority Artist Booking', 'Half-Day Session (4-5 Hrs)', 'Bespoke 3D Stencil Rendering', 'Premium Healing Balm', 'Lifetime Warranty & Touch-Ups'], isPopular: true, ctaText: 'Book Studio Session' },
    { name: 'Full Sleeve / Backpiece', price: '₹24,999', period: 'project', description: 'Multi-session masterpiece projects (Full Sleeve, Chest, or Backpiece).', features: ['Master Resident Artist', 'Multi-Session Package', 'Unlimited Design Revisions', 'VIP Private Studio Room', 'Full Aftercare Care Package'], isPopular: false, ctaText: 'Inquire Full Sleeve' }
  ];

  const list = plans && plans.length > 0 ? plans : defaults;

  return (
    <section className="r-section" id="pricing">
      <div className="r-container">
        <div className="r-section-header">
          <div className="r-subheading">TRANSPARENT PRICING</div>
          <h2 className="r-heading">Investment In Lifelong Art</h2>
          <p className="r-desc">Clear, fixed pricing packages with no hidden studio fees.</p>
        </div>

        <div className="r-pricing-grid">
          {list.map((plan, i) => (
            <div key={plan._id || i} className={`r-pricing-card ${plan.isPopular ? 'popular' : ''}`}>
              {plan.isPopular && <div className="r-pop-tag">★ MOST POPULAR</div>}
              <h3 className="r-plan-name">{plan.name}</h3>
              <div className="r-plan-price">
                {plan.price}
                <span className="r-plan-period">/{plan.period}</span>
              </div>
              <p className="r-plan-desc">{plan.description}</p>
              <ul className="r-plan-feats">
                {(plan.features || []).map((feat, fIdx) => (
                  <li key={fIdx}>✓ {feat}</li>
                ))}
              </ul>
              <a href="#order-form" className={`r-plan-btn ${plan.isPopular ? 'btn-gold' : ''}`}>
                {plan.ctaText || 'Book Session'}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
