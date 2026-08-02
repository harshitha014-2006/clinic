import React, { useState } from 'react';
import { api } from '../api';
import { Activity, Mail, Lock, ShieldAlert, ArrowLeft } from 'lucide-react';

const Login = ({ onLoginSuccess, onBackToPublic }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.login({ email, password });
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page animate-fade-in">
      <div className="login-card-container">
        
        {/* Back Button */}
        <button className="back-btn flex-align-center" onClick={onBackToPublic}>
          <ArrowLeft size={16} />
          <span>Back to Clinic Site</span>
        </button>

        <div className="card login-card animate-slide-up">
          <div className="login-header text-center">
            <div className="login-logo-circle">
              <Activity size={32} className="login-logo-icon" />
            </div>
            <h2>Admin Portal</h2>
            <p className="text-muted">Sign in to manage patient leads & scheduling</p>
          </div>

          {error && (
            <div className="alert alert-danger flex-align-center">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="admin@carepulse.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Seed accounts details for ease of testing */}
          <div className="seed-helper-box">
            <h5>Demo Credentials (Database Seed)</h5>
            <div className="demo-credentials">
              <p><strong>Admin:</strong> <code>admin@carepulse.com</code> / <code>admin123</code></p>
              <p><strong>Staff:</strong> <code>staff@carepulse.com</code> / <code>staff123</code></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
