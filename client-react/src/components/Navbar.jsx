import { useState, useEffect } from 'react';

export default function Navbar({ theme, onToggleTheme, user, onOpenAuth, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`r-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="r-container r-nav-inner">
        {/* Brand */}
        <a href="#" className="r-brand">
          <div className="r-brand-logo">I</div>
          <div className="r-brand-text">
            Ink<span>Draft</span>
            <div className="r-brand-sub">TATTOO STUDIO</div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <ul className="r-nav-links">
          <li><a href="#categories">Styles</a></li>
          <li><a href="#portfolio">Portfolio</a></li>
          <li><a href="#process">Process</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#testimonials">Reviews</a></li>
        </ul>

        {/* Actions */}
        <div className="r-nav-actions">
          {/* Day/Night Theme Toggle */}
          <button className="r-theme-toggle" onClick={onToggleTheme} title="Toggle Day/Night mode">
            {theme === 'day' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="r-user-menu-wrap">
              <button className="r-user-menu-btn" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                <span className="r-user-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <span>{user.name?.split(' ')[0]}</span>
                <span style={{ fontSize: '0.7rem' }}>▾</span>
              </button>
              {userDropdownOpen && (
                <div className="r-user-dropdown">
                  <div className="r-user-dropdown-info">
                    <div style={{ fontWeight: 700 }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user.email}</div>
                  </div>
                  <button className="r-user-dropdown-item r-logout-item" onClick={onLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button className="r-nav-login-btn" onClick={onOpenAuth}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: -1 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Login
            </button>
          )}

          <a href="#order-form" className="r-nav-cta-btn">Book Session</a>

          {/* Mobile Hamburger */}
          <button className="r-hamburger-btn" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="r-mobile-drawer">
          <a href="#categories" onClick={() => setMobileNavOpen(false)}>Styles</a>
          <a href="#portfolio" onClick={() => setMobileNavOpen(false)}>Portfolio</a>
          <a href="#process" onClick={() => setMobileNavOpen(false)}>Process</a>
          <a href="#pricing" onClick={() => setMobileNavOpen(false)}>Pricing</a>
          <a href="#testimonials" onClick={() => setMobileNavOpen(false)}>Reviews</a>
          {!user && <button className="r-nav-login-btn" onClick={() => { setMobileNavOpen(false); onOpenAuth(); }}>Login / Register</button>}
        </div>
      )}
    </header>
  );
}
