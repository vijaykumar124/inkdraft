/* ============================================================
   InkDraft — main.js
   Features: Theme Toggle, Navbar Scroll, Scroll Reveal,
             Counter Animation, Order Form, Mobile Nav
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. PAGE LOADER ──────────────────────────────────── */
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('done'), 1400);
  }

  /* ── 2. THEME TOGGLE (Day / Night) ───────────────────── */
  const themeBtn   = document.getElementById('theme-toggle');
  const body       = document.body;
  const THEME_KEY  = 'inkdraft-theme';

  // Load saved theme
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'day') {
    body.classList.add('day-mode');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDay = body.classList.toggle('day-mode');
      localStorage.setItem(THEME_KEY, isDay ? 'day' : 'night');

      // Optional ripple effect on toggle
      themeBtn.style.transform = 'scale(0.85)';
      setTimeout(() => { themeBtn.style.transform = ''; }, 200);
    });
  }

  /* ── 3. NAVBAR SCROLL EFFECT ─────────────────────────── */
  const navbar = document.getElementById('navbar');
  let lastY = 0;

  const handleScroll = () => {
    const y = window.scrollY;
    if (navbar) {
      if (y > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    lastY = y;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on load

  /* ── 4. MOBILE NAV ────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('nav-mobile');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── 5. SCROLL REVEAL (Intersection Observer) ─────────── */
  const revealElements = document.querySelectorAll('[data-reveal], .category-card, .journey-step, .design-card, .artist-card, .testimonial-card, .gallery-item, .pricing-card, .form-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => observer.observe(el));

  /* ── 6. COUNTER ANIMATION ─────────────────────────────── */
  const counters = document.querySelectorAll('[data-counter]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.counter, 10);
    const duration = 2000;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ── 7. ORDER FORM SUBMISSION ─────────────────────────── */
  const orderForm = document.getElementById('tattoo-order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = orderForm.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        const formData = new FormData(orderForm);
        const data = Object.fromEntries(formData);
        const res = await fetch('/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();

        if (result.success) {
          showToast(`✅ ${result.message} (${result.orderNumber})`, 'success');
          orderForm.reset();
        } else {
          showToast(`❌ ${result.message}`, 'error');
        }
      } catch {
        showToast('❌ Network error. Please try again.', 'error');
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  /* ── 8. TOAST NOTIFICATION ────────────────────────────── */
  window.showToast = function(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `show ${type}`;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.className = ''; }, 4000);
  };

  /* ── 9. SMOOTH SCROLL (for older browsers) ────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
