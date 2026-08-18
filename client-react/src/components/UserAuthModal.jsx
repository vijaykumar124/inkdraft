import { useState } from 'react';

export default function UserAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', phone: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const result = await res.json();
      if (result.success) {
        onAuthSuccess(result.user);
        onClose();
      } else {
        setErrorMsg(result.message || 'Login failed');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });
      const result = await res.json();
      if (result.success) {
        onAuthSuccess(result.user);
        onClose();
      } else {
        setErrorMsg(result.message || 'Signup failed');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="r-auth-backdrop" onClick={onClose}>
      <div className="r-auth-card" onClick={e => e.stopPropagation()}>
        <button className="r-auth-close" onClick={onClose}>✕</button>

        <div className="r-auth-header">
          <div className="r-auth-logo">I</div>
          <h2 className="r-auth-title">Ink<span>Draft</span></h2>
          <p className="r-auth-sub">Join InkDraft or Sign in to your account</p>
        </div>

        <div className="r-auth-tabs">
          <button className={`r-auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setErrorMsg(''); }}>Sign In</button>
          <button className={`r-auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setErrorMsg(''); }}>Create Account</button>
        </div>

        {errorMsg && <div className="r-auth-error">{errorMsg}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="r-auth-form">
            <div className="r-pub-group">
              <label className="r-pub-label">Email Address</label>
              <input type="email" className="r-pub-input" placeholder="you@example.com" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
            </div>
            <div className="r-pub-group">
              <label className="r-pub-label">Password</label>
              <input type="password" className="r-pub-input" placeholder="••••••••" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
            </div>
            <button type="submit" className="r-pub-submit-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign In →'}</button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="r-auth-form">
            <div className="r-pub-group">
              <label className="r-pub-label">Full Name *</label>
              <input type="text" className="r-pub-input" placeholder="John Doe" value={signupData.name} onChange={e => setSignupData({ ...signupData, name: e.target.value })} required />
            </div>
            <div className="r-pub-group">
              <label className="r-pub-label">Email Address *</label>
              <input type="email" className="r-pub-input" placeholder="you@example.com" value={signupData.email} onChange={e => setSignupData({ ...signupData, email: e.target.value })} required />
            </div>
            <div className="r-pub-group">
              <label className="r-pub-label">Phone Number</label>
              <input type="tel" className="r-pub-input" placeholder="+91 98765 43210" value={signupData.phone} onChange={e => setSignupData({ ...signupData, phone: e.target.value })} />
            </div>
            <div className="r-pub-group">
              <label className="r-pub-label">Password *</label>
              <input type="password" className="r-pub-input" placeholder="••••••••" value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} required minLength={6} />
            </div>
            <button type="submit" className="r-pub-submit-btn" disabled={loading}>{loading ? 'Creating account...' : 'Create Account →'}</button>
          </form>
        )}

        <div className="r-auth-footer">
          Are you a studio admin? <a href="/admin-panel/login" target="_blank" rel="noopener noreferrer" className="r-admin-link">Admin Login</a>
        </div>
      </div>
    </div>
  );
}
