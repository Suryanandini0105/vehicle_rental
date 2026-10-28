import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  CalendarCheck,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Compass,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Car size={22} />
          </div>
          <div className="brand-name">
            Drive<span>Ease</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/vehicles"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Browse Vehicles
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink
                to="/my-bookings"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                My Bookings
              </NavLink>
            </li>
          )}
          {isAdmin && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
                style={{
                  color: 'var(--primary)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ShieldAlert size={16} /> Admin Portal
              </NavLink>
            </li>
          )}
        </ul>

        {/* User / Authentication Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/profile"
                className="user-menu-btn"
                title="View Profile"
              >
                <User size={16} style={{ color: 'var(--primary)' }} />
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name.split(' ')[0]}
                </span>
                {isAdmin && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      background: 'var(--primary)',
                      color: 'var(--white)',
                      padding: '1px 5px',
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                style={{ padding: '0.45rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--navy-900)',
              display: 'none',
            }}
            className="mobile-toggle-btn"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--white)',
            borderBottom: '1px solid var(--slate-200)',
            padding: '1rem 1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.5rem 0', fontWeight: 600 }}
            >
              Home
            </Link>
            <Link
              to="/vehicles"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.5rem 0', fontWeight: 600 }}
            >
              Browse Vehicles
            </Link>
            {user && (
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '0.5rem 0', fontWeight: 600 }}
              >
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.5rem 0',
                  fontWeight: 600,
                  color: 'var(--primary)',
                }}
              >
                Admin Portal
              </Link>
            )}
            {user && (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '0.5rem 0', fontWeight: 600 }}
              >
                My Profile
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
