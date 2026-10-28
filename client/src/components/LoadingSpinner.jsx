import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', minHeight = '300px' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: '1rem',
        color: 'var(--slate-500)',
      }}
    >
      <Loader2
        size={36}
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--primary)',
        }}
      />
      <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{message}</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
