import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Portfolio from './components/Portfolio';
import Process from './components/Process';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import OrderForm from './components/OrderForm';
import UserAuthModal from './components/UserAuthModal';
import Footer from './components/Footer';
import CategoryPage from './components/CategoryPage';

function HomePage({ data, loading, theme, onToggleTheme, user, onOpenAuth, onLogout }) {
  return (
    <div className="r-public-app">
      <Navbar
        theme={theme}
        onToggleTheme={onToggleTheme}
        user={user}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />
      <Hero settings={data.settings} />
      <Categories categories={data.categories} />
      <Portfolio designs={data.featuredDesigns} />
      <Process />
      <Testimonials testimonials={data.testimonials} />
      <Pricing plans={data.pricingPlans} />
      <OrderForm />
      <Footer settings={data.settings} />
    </div>
  );
}

function CategoryPageWrapper({ theme, onToggleTheme, user, onOpenAuth, onLogout }) {
  return (
    <div className="r-public-app">
      <Navbar
        theme={theme}
        onToggleTheme={onToggleTheme}
        user={user}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />
      <CategoryPage />
    </div>
  );
}

export default function App() {
  const [data, setData] = useState({ artists: [], featuredDesigns: [], categories: [], testimonials: [], pricingPlans: [], settings: {} });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('inkdraft-theme') || 'night');
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (theme === 'day') document.body.classList.add('day-mode');
    else document.body.classList.remove('day-mode');
    localStorage.setItem('inkdraft-theme', theme);
  }, [theme]);

  useEffect(() => {
    fetch('/api/public/homepage')
      .then(r => r.json())
      .then(res => { if (res?.success) setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));

    fetch('/api/user/me')
      .then(r => r.json())
      .then(res => { if (res?.success && res.loggedIn) setUser(res.user); })
      .catch(() => {});
  }, []);

  const handleLogout = () => { fetch('/api/user/logout').then(() => setUser(null)); };
  const sharedProps = { theme, onToggleTheme: () => setTheme(t => t === 'night' ? 'day' : 'night'), user, onOpenAuth: () => setAuthModalOpen(true), onLogout: handleLogout };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/react/" element={
          <HomePage data={data} loading={loading} {...sharedProps} />
        } />
        <Route path="/react/category/:slug" element={
          <CategoryPageWrapper {...sharedProps} />
        } />
        {/* Fallback */}
        <Route path="*" element={
          <HomePage data={data} loading={loading} {...sharedProps} />
        } />
      </Routes>

      <UserAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />
    </BrowserRouter>
  );
}
