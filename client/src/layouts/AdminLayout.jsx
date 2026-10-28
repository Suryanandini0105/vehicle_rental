import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.5rem 0.75rem 1.25rem',
            borderBottom: '1px solid var(--slate-100)',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Admin Portal</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              DriveEase Operations
            </span>
          </div>
        </div>

        <div className="sidebar-title">Menu</div>

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/vehicles"
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <Car size={18} />
          <span>Manage Vehicles</span>
        </NavLink>

        <NavLink
          to="/admin/bookings"
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <CalendarCheck size={18} />
          <span>Manage Bookings</span>
        </NavLink>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--slate-100)' }}>
          <Link
            to="/"
            className="sidebar-link"
            style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
