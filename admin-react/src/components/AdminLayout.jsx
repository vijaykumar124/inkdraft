import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="r-app">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="r-main">
        <header className="r-header">
          <button className="r-hamburger" onClick={() => setMobileOpen(true)}>☰</button>
          <div className="r-header-brand">InkDraft Admin</div>
          <div className="r-header-actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="r-header-btn" title="View site">🌐</a>
          </div>
        </header>
        <main className="r-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
