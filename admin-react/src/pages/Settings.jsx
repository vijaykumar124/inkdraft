import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const { showToast } = useToast();

  useEffect(() => {
    api.getSettings().then(res => {
      if (res?.success) setSettings(res.data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await api.updateSettings(settings);
    setSaving(false);
    if (res?.success) showToast('Settings saved successfully', 'success');
    else showToast(res?.message || 'Failed to save', 'error');
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div className="r-form-group">
      <label className="r-label">{label}</label>
      <input
        type={type}
        className="r-input"
        value={settings[key] || ''}
        onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
      />
    </div>
  );

  const textarea = (label, key, placeholder = '') => (
    <div className="r-form-group">
      <label className="r-label">{label}</label>
      <textarea
        className="r-input r-textarea"
        rows={3}
        value={settings[key] || ''}
        onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
      />
    </div>
  );

  if (loading) return <Spinner />;

  return (
    <div className="r-page">
      <div className="r-page-header">
        <div>
          <h1 className="r-page-title">Section & Site Settings</h1>
          <div className="r-page-sub">Customize titles, content, hero image and layout settings for every section</div>
        </div>
        <button type="button" onClick={handleSubmit} className="r-btn r-btn-primary" disabled={saving}>
          {saving ? <><span className="r-spin" /> Saving...</> : '💾 Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', borderBottom: '1px solid var(--r-border)', paddingBottom: 12 }}>
        {[
          { id: 'hero', label: '🖼️ Hero Section' },
          { id: 'designs', label: '🎨 Featured Designs' },
          { id: 'categories', label: '📁 Categories' },
          { id: 'process', label: '⚡ Tattoo Process' },
          { id: 'testimonials', label: '⭐ Testimonials' },
          { id: 'pricing', label: '💳 Pricing' },
          { id: 'general', label: '⚙️ General & Contact' },
        ].map(t => (
          <button
            key={t.id}
            type="button"
            className={`r-btn r-btn-sm ${activeTab === t.id ? 'r-btn-primary' : 'r-btn-secondary'}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Hero Section Settings ── */}
        {activeTab === 'hero' && (
          <div className="r-card">
            <div className="r-card-header"><div className="r-card-title">Hero Section & Banner</div></div>
            <div className="r-card-body">
              <div className="r-form-grid">
                {field('Badge Text', 'heroBadge', 'text', 'APPOINTMENTS NOW OPEN')}
                {field('Hero Main Title', 'heroTitle', 'text', 'Wear Your Story In Custom Ink')}
                {field('Hero Image URL (Paste Direct Link)', 'heroImage', 'url', 'https://images.unsplash.com/...')}
                {field('CTA Primary Button Text', 'heroCtaPrimary', 'text', 'Book Consultation')}
                {field('CTA Secondary Button Text', 'heroCtaSecondary', 'text', 'Explore Portfolio')}
              </div>
              {textarea('Hero Subtitle / Description', 'heroSubtitle', 'World-class tattoo artists crafting bespoke, timeless body art...')}

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--r-border)' }}>
                <h4 style={{ color: 'var(--r-gold)', marginBottom: 12 }}>Hero Counter Statistics (4 Items)</h4>
                <div className="r-form-grid">
                  {field('Stat 1 Number', 'stat1Num', 'text', '5,000+')}
                  {field('Stat 1 Label', 'stat1Lbl', 'text', 'Custom Tattoos Ink\'d')}
                  {field('Stat 2 Number', 'stat2Num', 'text', '4.9 ★')}
                  {field('Stat 2 Label', 'stat2Lbl', 'text', 'Client Rating')}
                  {field('Stat 3 Number', 'stat3Num', 'text', '10+ Yrs')}
                  {field('Stat 3 Label', 'stat3Lbl', 'text', 'Master Experience')}
                  {field('Stat 4 Number', 'stat4Num', 'text', '100%')}
                  {field('Stat 4 Label', 'stat4Lbl', 'text', 'Sterilized & Safe')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Featured Designs Section ── */}
        {activeTab === 'designs' && (
          <div className="r-card">
            <div className="r-card-header"><div className="r-card-title">Featured Designs Section</div></div>
            <div className="r-card-body">
              <div className="r-form-grid">
                {field('Section Badge', 'designsBadge', 'text', 'OUR PORTFOLIO')}
                {field('Section Title', 'designsTitle', 'text', 'Featured Designs')}
                {field('Section Subtitle', 'designsSub', 'text', 'Explore custom body art crafted by our master tattoo artists')}
              </div>
            </div>
          </div>
        )}

        {/* ── Categories Section ── */}
        {activeTab === 'categories' && (
          <div className="r-card">
            <div className="r-card-header"><div className="r-card-title">Categories & Styles Section</div></div>
            <div className="r-card-body">
              <div className="r-form-grid">
                {field('Section Badge', 'categoriesBadge', 'text', 'EXPLORE STYLES')}
                {field('Section Title', 'categoriesTitle', 'text', 'Tattoo Categories')}
                {field('Section Subtitle', 'categoriesSub', 'text', 'Find the style that resonates with your vision')}
              </div>
            </div>
          </div>
        )}

        {/* ── Process Section ── */}
        {activeTab === 'process' && (
          <div className="r-card">
            <div className="r-card-header"><div className="r-card-title">Tattoo Journey / Process Section</div></div>
            <div className="r-card-body">
              <div className="r-form-grid">
                {field('Section Badge', 'processBadge', 'text', 'HOW IT WORKS')}
                {field('Section Title', 'processTitle', 'text', 'Your Tattoo Journey')}
              </div>
              <div className="r-form-grid" style={{ marginTop: 16 }}>
                {field('Step 1 Title', 'step1Title', 'text', '1. Consultation')}
                {field('Step 1 Desc', 'step1Desc', 'text', 'Discuss placement, sizing, and concept')}
                {field('Step 2 Title', 'step2Title', 'text', '2. Custom Design')}
                {field('Step 2 Desc', 'step2Desc', 'text', 'We create a unique digital blueprint for your skin')}
                {field('Step 3 Title', 'step3Title', 'text', '3. Tattoo Session')}
                {field('Step 3 Desc', 'step3Desc', 'text', 'Crafted with precision in a hygienic studio')}
                {field('Step 4 Title', 'step4Title', 'text', '4. Aftercare')}
                {field('Step 4 Desc', 'step4Desc', 'text', 'Complete guidance for vibrant, long-lasting ink')}
              </div>
            </div>
          </div>
        )}

        {/* ── Testimonials Section ── */}
        {activeTab === 'testimonials' && (
          <div className="r-card">
            <div className="r-card-header"><div className="r-card-title">Testimonials / Reviews Section</div></div>
            <div className="r-card-body">
              <div className="r-form-grid">
                {field('Section Badge', 'testimonialsBadge', 'text', 'CLIENT REVIEWS')}
                {field('Section Title', 'testimonialsTitle', 'text', 'Trusted by Thousands')}
                {field('Section Subtitle', 'testimonialsSub', 'text', 'Read honest experiences from clients who brought their skin art to life')}
              </div>
            </div>
          </div>
        )}

        {/* ── Pricing Section ── */}
        {activeTab === 'pricing' && (
          <div className="r-card">
            <div className="r-card-header"><div className="r-card-title">Pricing Section</div></div>
            <div className="r-card-body">
              <div className="r-form-grid">
                {field('Section Badge', 'pricingBadge', 'text', 'TRANSPARENT PRICING')}
                {field('Section Title', 'pricingTitle', 'text', 'Investment In Art')}
                {field('Section Subtitle', 'pricingSub', 'text', 'Fair, transparent rates for world-class custom body art')}
              </div>
            </div>
          </div>
        )}

        {/* ── General & Contact Settings ── */}
        {activeTab === 'general' && (
          <div className="r-card">
            <div className="r-card-header"><div className="r-card-title">General Site Info & Contact</div></div>
            <div className="r-card-body">
              <div className="r-form-grid">
                {field('Site Title', 'siteTitle', 'text', 'InkDraft')}
                {field('Tagline', 'tagline', 'text', 'Custom Tattoo Artistry Studio')}
                {field('Phone / WhatsApp', 'phone', 'tel', '+1 (555) 000-0000')}
                {field('Studio Email', 'email', 'email', 'hello@inkdraft.com')}
                {field('Studio Address', 'address', 'text', '123 Art Avenue, Ink City')}
                {field('Working Hours', 'workingHours', 'text', 'Mon-Sat 10AM-8PM')}
              </div>
              {textarea('Meta Description (SEO)', 'metaDescription', 'InkDraft is a premier custom tattoo studio...')}

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--r-border)' }}>
                <h4 style={{ color: 'var(--r-gold)', marginBottom: 12 }}>Social Media Links</h4>
                <div className="r-form-grid">
                  {field('Instagram URL', 'instagramUrl', 'url', 'https://instagram.com/inkdraft')}
                  {field('Facebook URL', 'facebookUrl', 'url', 'https://facebook.com/inkdraft')}
                  {field('Twitter/X URL', 'twitterUrl', 'url', 'https://twitter.com/inkdraft')}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="submit" className="r-btn r-btn-primary" disabled={saving} style={{ minWidth: 160 }}>
            {saving ? <><span className="r-spin" /> Saving...</> : '💾 Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
