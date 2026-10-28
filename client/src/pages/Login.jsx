import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import { Car, Lock, Mail, ShieldAlert, UserCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setInfo('Your previous session has expired. Please log in again to continue.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);

    if (result.success) {
      // Redirect admin to /admin dashboard or customer to previous page / my-bookings
      const destination =
        result.user.role === 'admin'
          ? '/admin'
          : location.state?.from?.pathname || '/my-bookings';

      navigate(destination, { replace: true });
    } else {
      setError(result.message);
      setSubmitting(false);
    }
  };

  // Quick fill helper for evaluator/student convenience
  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <div
      style={{
        padding: '4rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 140px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1px solid var(--slate-200)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="brand-icon"
            style={{ width: 44, height: 44, margin: '0 auto 1rem' }}
          >
            <Car size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Sign in to access your bookings and manage vehicle reservations.
          </p>
        </div>

        {info && <AlertMessage type="info" message={info} onClose={() => setInfo('')} />}
        {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--slate-400)',
                }}
              />
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                style={{ paddingLeft: '2.4rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--slate-400)',
                }}
              />
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                style={{ paddingLeft: '2.4rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '44px', marginTop: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Credentials Box for Examiner / Evaluator */}
        <div
          style={{
            marginTop: '1.75rem',
            padding: '1rem',
            backgroundColor: 'var(--slate-50)',
            border: '1px dashed var(--slate-300)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
              marginBottom: '0.6rem',
              textAlign: 'center',
            }}
          >
            Quick Demo Fill (FSD Evaluation)
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.775rem' }}
              onClick={() => fillCredentials('rahul.sharma@example.com', 'Customer@123')}
            >
              <UserCheck size={14} /> Customer
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.775rem', color: 'var(--primary)' }}
              onClick={() => fillCredentials('bhavya@driveease.com', 'bhavya@0507')}
            >
              <ShieldAlert size={14} /> Admin (Bhavya)
            </button>
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--slate-100)',
            fontSize: '0.9rem',
            color: 'var(--slate-500)',
          }}
        >
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
