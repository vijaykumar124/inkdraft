import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        <h1 className="r-page-title">Settings</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="r-card" style={{ marginBottom: 20 }}>
          <div className="r-card-header"><div className="r-card-title">General</div></div>
          <div className="r-card-body">
            <div className="r-form-grid">
              {field('Site Title', 'siteTitle', 'text', 'InkDraft')}
              {field('Tagline', 'tagline', 'text', 'Design Your Next Tattoo')}
              {field('Phone', 'phone', 'tel', '+1 (555) 000-0000')}
              {field('Email', 'email', 'email', 'hello@inkdraft.com')}
              {field('Address', 'address', 'text', '123 Ink Street')}
              {field('Working Hours', 'workingHours', 'text', 'Mon-Sat 10AM-8PM')}
            </div>
            {textarea('Meta Description (SEO)', 'metaDescription', 'Premium tattoo studio...')}
          </div>
        </div>

        <div className="r-card" style={{ marginBottom: 20 }}>
          <div className="r-card-header"><div className="r-card-title">Social Media</div></div>
          <div className="r-card-body">
            <div className="r-form-grid">
              {field('Instagram URL', 'instagramUrl', 'url', 'https://instagram.com/...')}
              {field('Facebook URL', 'facebookUrl', 'url', 'https://facebook.com/...')}
              {field('Twitter/X URL', 'twitterUrl', 'url', 'https://twitter.com/...')}
              {field('YouTube URL', 'youtubeUrl', 'url', 'https://youtube.com/...')}
            </div>
          </div>
        </div>

        <div className="r-card" style={{ marginBottom: 20 }}>
          <div className="r-card-header"><div className="r-card-title">Hero Section</div></div>
          <div className="r-card-body">
            <div className="r-form-grid">
              {field('Hero Title', 'heroTitle', 'text', 'Wear Your Story')}
              {field('Hero Subtitle', 'heroSubtitle', 'text', 'World-class tattoo artistry...')}
              {field('Hero CTA Text', 'heroCta', 'text', 'Book Your Session')}
              {field('Hero Image URL', 'heroImage', 'url', 'https://...')}
            </div>
          </div>
        </div>

        <div className="r-card" style={{ marginBottom: 20 }}>
          <div className="r-card-header"><div className="r-card-title">About</div></div>
          <div className="r-card-body">
            {textarea('About Text', 'aboutText', 'Tell visitors about your studio...')}
            {field('Years of Experience', 'yearsExperience', 'number', '10')}
            {field('Artists Count', 'artistsCount', 'number', '8')}
            {field('Tattoos Done', 'tattoosDone', 'number', '5000')}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="submit" className="r-btn r-btn-primary" disabled={saving} style={{ minWidth: 140 }}>
            {saving ? <><span className="r-spin" /> Saving...</> : '💾 Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
