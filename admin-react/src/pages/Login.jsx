import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/admin-panel/dashboard');
    } else {
      showToast(res.message || 'Login failed', 'error');
    }
  };

  return (
    <div className="r-login-page">
      <div className="r-login-card">
        <div className="r-login-logo">I</div>
        <div className="r-login-title">InkDraft <span>Admin</span></div>
        <div className="r-login-sub">Sign in to your dashboard</div>
        <form onSubmit={handleSubmit} className="r-login-form">
          <div className="r-form-group">
            <label className="r-label">Email</label>
            <input
              type="email"
              className="r-input"
              placeholder="admin@inkdraft.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="r-form-group">
            <label className="r-label">Password</label>
            <input
              type="password"
              className="r-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="r-btn r-btn-primary r-btn-full" disabled={loading}>
            {loading ? <span className="r-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="r-login-footer">
          <a href="/admin/login" className="r-login-link">Switch to Classic Admin →</a>
        </div>
      </div>
    </div>
  );
}
