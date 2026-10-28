import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />,
    danger: <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />,
    info: <Info size={18} style={{ color: 'var(--info)', flexShrink: 0 }} />,
  };

  const alertClasses = {
    success: 'alert alert-success',
    danger: 'alert alert-danger',
    info: 'alert alert-info',
  };

  return (
    <div className={alertClasses[type] || 'alert alert-info'}>
      {icons[type] || icons.info}
      <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: 'inherit',
            opacity: 0.7,
          }}
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
