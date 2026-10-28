import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AlertMessage from '../components/AlertMessage';
import { User, Mail, Phone, Calendar, ShieldCheck, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateUserData } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await api.put('/auth/me', { name, phone });
      if (res.data && res.data.user) {
        updateUserData(res.data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: '2rem' }}>
          <span
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Personal Account
          </span>
          <h1 style={{ fontSize: '2.25rem', marginTop: '0.2rem' }}>
            User Profile & Settings
          </h1>
        </div>

        {message && (
          <AlertMessage
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        )}

        <div
          style={{
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            border: '1px solid var(--slate-200)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* User overview banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid var(--slate-100)',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{user?.name}</h2>
                <span
                  className={`badge ${
                    user?.role === 'admin' ? 'badge-primary' : 'badge-category'
                  }`}
                >
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
                Member since {new Date(user?.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User
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
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.4rem' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
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
                  style={{ paddingLeft: '2.4rem', backgroundColor: 'var(--slate-50)' }}
                  value={user?.email || ''}
                  disabled
                />
              </div>
              <small style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>
                Account email is tied to booking references and cannot be modified.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone
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
                  type="tel"
                  className="form-control"
                  style={{ paddingLeft: '2.4rem' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--slate-100)',
              }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                <Save size={16} />
                {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
