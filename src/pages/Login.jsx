import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    if (!ok) setError('Invalid email or password. Please try again.');
    setLoading(false);
  }

  return (
    <div className="login-page">

      {/* ── Left: Brand panel ── */}
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-hero">
            <h1>Redefining Beauty Through Science.</h1>
            <p>Premium aesthetic clinic management — patients, appointments, and WhatsApp reminders, beautifully organised.</p>
          </div>

          <ul className="login-features">
            <li><span>Complete patient records & visit history</span></li>
            <li><span>Appointment scheduling with daily limits</span></li>
            <li><span>WhatsApp reminders in one click</span></li>
            <li><span>Role-based access for your team</span></li>
          </ul>

          <div className="login-left-card">
            <div className="login-stat-row">
              <div className="login-stat">
                <span className="login-stat-value">∞</span>
                <span className="login-stat-label">Patients</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat">
                <span className="login-stat-value">Live</span>
                <span className="login-stat-label">Appointments</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat">
                <span className="login-stat-value">2</span>
                <span className="login-stat-label">Roles</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="login-right">
        <div className="login-form-wrap">

          <div className="login-form-logo">
            <img src="https://www.theskinlife.co.in/logo.png" alt="" className="login-form-logo-emblem" />
            <img src="https://www.theskinlife.co.in/brandname.png" alt="The Skin Life" className="login-form-logo-brand" />
          </div>

          <div className="login-heading">
            <h2>Welcome back</h2>
            <p>Sign in to your clinic dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="login-input-wrap">
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
