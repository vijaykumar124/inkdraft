export default function Footer({ settings }) {
  return (
    <footer className="r-footer">
      <div className="r-container">
        <div className="r-footer-grid">
          <div className="r-footer-brand">
            <a href="#" className="r-brand">
              <div className="r-brand-logo">I</div>
              <div className="r-brand-text">Ink<span>Draft</span></div>
            </a>
            <p className="r-footer-tagline">Custom tattoo artistry crafted by world-class resident masters.</p>
            <div className="r-footer-social">
              <a href={settings?.instagramUrl || '#'} target="_blank" rel="noopener noreferrer">📷 Instagram</a>
              <a href={settings?.facebookUrl || '#'} target="_blank" rel="noopener noreferrer">📘 Facebook</a>
            </div>
          </div>

          <div>
            <div className="r-footer-heading">Studio</div>
            <ul className="r-footer-links">
              <li><a href="#categories">Styles</a></li>
              <li><a href="#portfolio">Portfolio</a></li>
              <li><a href="#process">Process</a></li>
              <li><a href="#artists">Artists</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>

          <div>
            <div className="r-footer-heading">Services</div>
            <ul className="r-footer-links">
              <li><a href="#order-form">Custom Consultation</a></li>
              <li><a href="#order-form">Cover-Up Tattoos</a></li>
              <li><a href="#order-form">Touch-Up Sessions</a></li>
              <li><a href="#order-form">Gift Vouchers</a></li>
            </ul>
          </div>

          <div>
            <div className="r-footer-heading">Contact</div>
            <ul className="r-footer-links">
              <li><a href={`mailto:${settings?.email || 'hello@inkdraft.com'}`}>{settings?.email || 'hello@inkdraft.com'}</a></li>
              <li><a href={`tel:${settings?.phone || '+15550000000'}`}>{settings?.phone || '+1 (555) 000-0000'}</a></li>
              <li><span>{settings?.address || '123 Ink Street, Studio 4'}</span></li>
              <li><span>{settings?.workingHours || 'Mon-Sat: 10am - 8pm'}</span></li>
            </ul>
          </div>
        </div>

        <div className="r-footer-bottom">
          <span>© {new Date().getFullYear()} InkDraft Tattoo Studio. All rights reserved.</span>
          <div>
            <a href="/admin-panel/login" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>Studio Admin</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
