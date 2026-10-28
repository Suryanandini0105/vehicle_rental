import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import ConfirmationModal from '../../components/ConfirmationModal';
import {
  CalendarCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  CheckCheck,
  User,
  Car,
  Filter,
} from 'lucide-react';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Status transition action state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filterStatus !== 'All') queryParams.append('status', filterStatus);
      if (search.trim()) queryParams.append('search', search.trim());

      const res = await api.get(`/admin/bookings?${queryParams.toString()}`);
      if (res.data && res.data.bookings) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to fetch bookings list.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus, search]);

  const handleOpenStatusModal = (booking, newStatus) => {
    setSelectedBooking(booking);
    setTargetStatus(newStatus);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedBooking || !targetStatus) return;
    setActionLoading(true);

    try {
      const res = await api.patch(
        `/admin/bookings/${selectedBooking._id}/status`,
        {
          status: targetStatus,
          reason:
            targetStatus === 'Cancelled' ? 'Cancelled by administrator' : null,
        }
      );

      setAlert({
        type: 'success',
        text: `Booking ${selectedBooking.bookingReference} status updated to ${targetStatus}!`,
      });

      // Update state
      setBookings((prev) =>
        prev.map((b) => (b._id === selectedBooking._id ? res.data.booking : b))
      );
    } catch (err) {
      setAlert({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update booking status.',
      });
    } finally {
      setActionLoading(false);
      setIsConfirmModalOpen(false);
      setSelectedBooking(null);
      setTargetStatus('');
    }
  };

  const statusBadges = {
    Pending: 'badge-pending',
    Confirmed: 'badge-confirmed',
    Completed: 'badge-completed',
    Cancelled: 'badge-cancelled',
  };

  return (
    <div>
      {/* Header */}
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
          Operations Management
        </span>
        <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Fleet Reservations</h1>
      </div>

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.text}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--white)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--slate-200)',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search
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
            placeholder="Search by ref # or customer email..."
            style={{ paddingLeft: '2.4rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select
            className="form-control"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses ({bookings.length})</option>
            <option value="Pending">Pending Approval</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <LoadingSpinner message="Retrieving fleet bookings..." />
      ) : bookings.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--white)',
            padding: '3rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--slate-200)',
          }}
        >
          <CalendarCheck size={48} style={{ color: 'var(--slate-400)', margin: '0 auto 1rem' }} />
          <h3>No Booking Records Found</h3>
          <p style={{ color: 'var(--slate-500)', marginTop: '0.5rem' }}>
            There are currently no bookings matching this criteria.
          </p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Rental Schedule</th>
                <th>Total (INR)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <strong style={{ color: 'var(--primary)', letterSpacing: '0.05em' }}>
                      {b.bookingReference}
                    </strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      {new Date(b.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <strong>{b.user?.name || 'Customer'}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      {b.user?.email}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      {b.user?.phone}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img
                        src={b.vehicle?.image}
                        alt="car"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=100&q=80';
                        }}
                      />
                      <div>
                        <strong>{b.vehicle?.brand} {b.vehicle?.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          {b.vehicle?.registrationNumber}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>
                      {new Date(b.pickupDate).toLocaleDateString('en-IN')}
                    </span>
                    <span style={{ color: 'var(--slate-400)', margin: '0 4px' }}>→</span>
                    <span style={{ fontSize: '0.85rem' }}>
                      {new Date(b.returnDate).toLocaleDateString('en-IN')}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      {b.rentalDays} Days
                    </span>
                  </td>
                  <td>
                    <strong>₹{b.totalAmount.toLocaleString('en-IN')}</strong>
                  </td>
                  <td>
                    <span className={`badge ${statusBadges[b.status] || 'badge-category'}`}>
                      {b.status}
                    </span>
                    {b.cancelledBy && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--danger)', marginTop: 2 }}>
                        by {b.cancelledBy}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      {/* Status transitions allowed according to lifecycle */}
                      {b.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(b, 'Confirmed')}
                            className="btn btn-primary btn-sm"
                            title="Confirm Booking"
                            style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                          >
                            <CheckCircle size={14} /> Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(b, 'Cancelled')}
                            className="btn btn-outline-danger btn-sm"
                            title="Reject/Cancel"
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        </>
                      )}

                      {b.status === 'Confirmed' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(b, 'Completed')}
                            className="btn btn-primary btn-sm"
                            title="Mark as Completed"
                          >
                            <CheckCheck size={14} /> Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(b, 'Cancelled')}
                            className="btn btn-outline-danger btn-sm"
                            title="Cancel Booking"
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        </>
                      )}

                      {(b.status === 'Completed' || b.status === 'Cancelled') && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          Finalized
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title={`Set Status to ${targetStatus}?`}
        message={`Are you sure you want to change reservation ${selectedBooking?.bookingReference} from '${selectedBooking?.status}' to '${targetStatus}'?`}
        confirmText={`Yes, Set as ${targetStatus}`}
        confirmVariant={targetStatus === 'Cancelled' ? 'btn-danger' : 'btn-primary'}
        isLoading={actionLoading}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};

export default ManageBookings;
