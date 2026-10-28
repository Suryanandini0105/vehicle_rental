import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Car,
  CalendarCheck,
  Users,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
  Plus,
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load administrative analytics.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating live MongoDB fleet analytics..." />;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const { stats, categoryStats, recentBookings } = data || {};

  const statusBadges = {
    Pending: 'badge-pending',
    Confirmed: 'badge-confirmed',
    Completed: 'badge-completed',
    Cancelled: 'badge-cancelled',
  };

  return (
    <div>
      {/* Page Title & Quick Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <span
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Management Overview
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Operations Dashboard</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/vehicles?action=new" className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Vehicle
          </Link>
          <Link to="/admin/bookings" className="btn btn-secondary btn-sm">
            View All Bookings
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="stats-grid">
        {/* Total Vehicles */}
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            <Car size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Vehicles</span>
            <div className="stat-value">{stats?.totalVehicles || 0}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
              {stats?.availableVehicles || 0} Available
            </span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: '#ecfdf5', color: 'var(--success)' }}
          >
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Reservations</span>
            <div className="stat-value">{stats?.totalBookings || 0}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>
              {stats?.pendingBookings || 0} Pending Approval
            </span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}
          >
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Registered Customers</span>
            <div className="stat-value">{stats?.totalCustomers || 0}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              Verified Accounts
            </span>
          </div>
        </div>

        {/* Gross Revenue */}
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: '#fffbeb', color: 'var(--warning)' }}
          >
            <IndianRupee size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Confirmed Revenue</span>
            <div className="stat-value">
              ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              Confirmed + Completed
            </span>
          </div>
        </div>
      </div>

      {/* Booking Status Breakdown Bar */}
      <div
        style={{
          backgroundColor: 'var(--white)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--slate-200)',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={20} style={{ color: 'var(--warning)' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Pending</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stats?.pendingBookings || 0}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle size={20} style={{ color: 'var(--success)' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Confirmed</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stats?.confirmedBookings || 0}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Completed</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stats?.completedBookings || 0}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <XCircle size={20} style={{ color: 'var(--danger)' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Cancelled</span>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stats?.cancelledBookings || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div
        style={{
          backgroundColor: 'var(--white)',
          border: '1px solid var(--slate-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Recent Booking Activity</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)' }}>
              Latest reservation requests submitted across all customers.
            </p>
          </div>
          <Link
            to="/admin/bookings"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            Manage All <ChevronRight size={14} />
          </Link>
        </div>

        {recentBookings && recentBookings.length > 0 ? (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong style={{ color: 'var(--primary)', letterSpacing: '0.05em' }}>
                        {b.bookingReference}
                      </strong>
                    </td>
                    <td>
                      <div>
                        <strong>{b.user?.name || 'Customer'}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          {b.user?.email}
                        </span>
                      </div>
                    </td>
                    <td>
                      {b.vehicle?.brand} {b.vehicle?.name}
                    </td>
                    <td>
                      {new Date(b.pickupDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      —{' '}
                      {new Date(b.returnDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td>
                      <strong>₹{b.totalAmount.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span className={`badge ${statusBadges[b.status] || 'badge-category'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
            No recent bookings recorded in the system yet.
          </p>
        )}
      </div>

      {/* Fleet Category Distribution */}
      {categoryStats && categoryStats.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Fleet Category Breakdown</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
            }}
          >
            {categoryStats.map((cat) => (
              <div
                key={cat._id}
                style={{
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  border: '1px solid var(--slate-200)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                  {cat._id}
                </span>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {cat.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
