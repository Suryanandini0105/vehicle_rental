import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--slate-100)',
            color: 'var(--slate-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <Compass size={44} />
        </div>
        <h1
          style={{
            fontSize: '4.5rem',
            fontWeight: 800,
            color: 'var(--navy-900)',
            lineHeight: 1,
            marginBottom: '0.5rem',
          }}
        >
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          Destination Not Found
        </h2>
        <p
          style={{
            color: 'var(--slate-500)',
            lineHeight: 1.6,
            marginBottom: '2rem',
            fontSize: '0.95rem',
          }}
        >
          The road you took does not lead anywhere. The page may have been moved,
          deleted, or the link might be mistyped.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={18} /> Return Home
          </Link>
          <Link to="/vehicles" className="btn btn-secondary">
            Browse Fleet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
