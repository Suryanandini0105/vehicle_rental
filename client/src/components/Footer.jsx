import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Clock, Headphones, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1rem',
              }}
            >
              <div className="brand-icon">
                <Car size={20} />
              </div>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--white)',
                }}
              >
                Drive<span style={{ color: 'var(--primary)' }}>Ease</span>
              </span>
            </div>
            <p
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--slate-400)',
                marginBottom: '1.25rem',
              }}
            >
              DriveEase is a modern vehicle rental management solution offering premium,
              sanitized, and insured cars for self-drive city trips and outstation travel.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                fontSize: '0.8rem',
                color: '#94a3b8',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={14} style={{ color: 'var(--success)' }} /> Verified Fleet
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={14} style={{ color: 'var(--primary)' }} /> 24/7 Roadside
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4>Quick Links</h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                fontSize: '0.9rem',
              }}
            >
              <li>
                <Link to="/">Home Page</Link>
              </li>
              <li>
                <Link to="/vehicles">Browse Vehicles</Link>
              </li>
              <li>
                <Link to="/vehicles?category=Electric">Electric Vehicles (EVs)</Link>
              </li>
              <li>
                <Link to="/vehicles?category=SUV">SUVs & Crossovers</Link>
              </li>
              <li>
                <Link to="/vehicles?category=Luxury">Executive Luxury Fleet</Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4>Customer Care</h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                fontSize: '0.9rem',
              }}
            >
              <li>
                <Link to="/my-bookings">My Reservations</Link>
              </li>
              <li>
                <Link to="/profile">Profile & Security</Link>
              </li>
              <li style={{ color: 'var(--slate-400)' }}>
                Rental Terms & Policies
              </li>
              <li style={{ color: 'var(--slate-400)' }}>
                No Hidden Charges Guarantee
              </li>
            </ul>
          </div>

          {/* Mini Project Academic Meta */}
          <div>
            <h4>Academic Project</h4>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                fontSize: '0.825rem',
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#60a5fa',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                <Award size={16} /> MERN Mini-Project
              </div>
              <p style={{ color: 'var(--slate-400)' }}>
                Built with MongoDB Atlas, Express.js, React (Vite), and Node.js for Full Stack Development evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} DriveEase Inc. All rights reserved. Designed for College FSD Mini-Project.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
