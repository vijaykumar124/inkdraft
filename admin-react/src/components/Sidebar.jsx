import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { section: 'Main', items: [
    { to: '/admin-panel/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin-panel/orders', icon: '📋', label: 'Orders' },
    { to: '/admin-panel/users', icon: '👥', label: 'Users' },
  ]},
  { section: 'Content', items: [
    { to: '/admin-panel/artists', icon: '👤', label: 'Artists' },
    { to: '/admin-panel/designs', icon: '🎨', label: 'Designs' },
    { to: '/admin-panel/categories', icon: '📁', label: 'Categories' },
    { to: '/admin-panel/testimonials', icon: '⭐', label: 'Testimonials' },
  ]},
  { section: 'Business', items: [
    { to: '/admin-panel/pricing', icon: '💳', label: 'Pricing Plans' },
    { to: '/admin-panel/settings', icon: '⚙️', label: 'Settings' },
  ]},
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin-panel/login');
  };

  return (
    <>
      {mobileOpen && <div className="r-sidebar-overlay" onClick={onMobileClose} />}
      <aside className={`r-sidebar ${mobileOpen ? 'r-sidebar-open' : ''}`}>
        <div className="r-sidebar-brand">
          <div className="r-sidebar-logo">I</div>
          <div>
            <div className="r-sidebar-name">Ink<span>Draft</span></div>
            <div className="r-sidebar-sub">React Admin</div>
          </div>
        </div>

        <nav className="r-sidebar-nav">
          {navItems.map(group => (
            <div key={group.section}>
              <div className="r-sidebar-section">{group.section}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `r-sidebar-link${isActive ? ' active' : ''}`}
                  onClick={onMobileClose}
                >
                  <span className="r-sidebar-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}

          <div className="r-sidebar-section">Site</div>
          <a href="/" target="_blank" rel="noopener noreferrer" className="r-sidebar-link">
            <span className="r-sidebar-icon">🌐</span> View Site
          </a>
          <button className="r-sidebar-link r-sidebar-logout" onClick={handleLogout}>
            <span className="r-sidebar-icon">🚪</span> Logout
          </button>
        </nav>

        {user && (
          <div className="r-sidebar-footer">
            <div className="r-admin-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="r-admin-name">{user.name}</div>
              <div className="r-admin-role">{user.role}</div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
