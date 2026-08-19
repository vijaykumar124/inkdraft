import { useState, useEffect } from 'react';
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

export default function App() {
  const [data, setData] = useState({ artists: [], featuredDesigns: [], categories: [], testimonials: [], pricingPlans: [], settings: {} });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('inkdraft-theme') || 'night');
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Sync theme to body class
  useEffect(() => {
    if (theme === 'day') document.body.classList.add('day-mode');
    else document.body.classList.remove('day-mode');
    localStorage.setItem('inkdraft-theme', theme);
  }, [theme]);

  // Load homepage data & user session
  useEffect(() => {
    fetch('/api/public/homepage')
      .then(r => r.json())
      .then(res => {
        if (res?.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/user/me')
      .then(r => r.json())
      .then(res => {
        if (res?.success && res.loggedIn) setUser(res.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    fetch('/api/user/logout').then(() => setUser(null));
  };

  return (
    <div className="r-public-app">
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'night' ? 'day' : 'night')}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <Hero settings={data.settings} />
      <Categories categories={data.categories} />
      <Portfolio designs={data.featuredDesigns} />
      <Process />
      <Testimonials testimonials={data.testimonials} />
      <Pricing plans={data.pricingPlans} />
      <OrderForm />
      <Footer settings={data.settings} />

      <UserAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
