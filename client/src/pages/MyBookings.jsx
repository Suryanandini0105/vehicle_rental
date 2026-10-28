import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Calendar,
  Clock,
  CarFront,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Cancel booking modal state
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      if (res.data && res.data.bookings) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to retrieve your booking records.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancelModal = (bookingId) => {
    setCancellingBookingId(bookingId);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBookingId) return;
    setCancelLoading(true);
    setActionMessage(null);

    try {
      const res = await api.patch(`/bookings/${cancellingBookingId}/cancel`, {
        reason: 'Cancelled by customer online',
      });

      if (res.data && res.data.success) {
        setActionMessage({
          type: 'success',
          text: 'Booking has been successfully cancelled.',
        });
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === cancellingBookingId
              ? { ...b, status: 'Cancelled', cancelledBy: 'customer' }
              : b
          )
        );
      }
    } catch (err) {
      setActionMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Could not cancel booking.',
      });
    } finally {
      setCancelLoading(false);
      setIsCancelModalOpen(false);
      setCancellingBookingId(null);
    }
  };

  const filteredBookings =
    filterStatus === 'All'
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  const statusBadges = {
    Pending: 'badge-pending',
    Confirmed: 'badge-confirmed',
    Completed: 'badge-completed',
    Cancelled: 'badge-cancelled',
  };

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
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
              Account Reservations
            </span>
            <h1 style={{ fontSize: '2.25rem', marginTop: '0.2rem' }}>
              My Bookings & History
            </h1>
          </div>
          <Link to="/vehicles" className="btn btn-primary">
            <CarFront size={18} /> Rent Another Vehicle
          </Link>
        </div>

        {actionMessage && (
          <AlertMessage
            type={actionMessage.type}
            message={actionMessage.text}
            onClose={() => setActionMessage(null)}
          />
        )}

        {/* Status Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
            backgroundColor: 'var(--white)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--slate-200)',
            width: 'fit-content',
          }}
        >
          {['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="btn btn-sm"
              style={{
                backgroundColor:
                  filterStatus === status ? 'var(--navy-900)' : 'transparent',
                color:
                  filterStatus === status ? 'var(--white)' : 'var(--navy-700)',
                border: 'none',
              }}
            >
              {status}
              {status === 'All' && ` (${bookings.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner message="Fetching your reservations..." />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : filteredBookings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)',
            }}
          >
            <Calendar size={48} style={{ color: 'var(--slate-400)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {filterStatus === 'All'
                ? 'No Bookings Found'
                : `No ${filterStatus} Bookings`}
            </h3>
            <p style={{ color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
              You don’t have any reservations under this category yet.
            </p>
            <Link to="/vehicles" className="btn btn-primary btn-sm">
              Explore Our Cars
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredBookings.map((b) => {
              const isPastPickup = new Date(b.pickupDate) <= new Date();
              const canCancel =
                (b.status === 'Pending' || b.status === 'Confirmed') &&
                (!isPastPickup || b.status === 'Pending');

              return (
                <div
                  key={b._id}
                  style={{
                    backgroundColor: 'var(--white)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--slate-200)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'grid',
                    gridTemplateColumns: '180px 1fr auto',
                    gap: '1.5rem',
                    alignItems: 'center',
                  }}
                  className="booking-record-card"
                >
                  {/* Vehicle Thumbnail */}
                  <div
                    style={{
                      height: 120,
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--slate-100)',
                    }}
                  >
                    <img
                      src={b.vehicle?.image}
                      alt={b.vehicle?.name || 'Vehicle'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>

                  {/* Booking Information */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          letterSpacing: '0.05em',
                        }}
                      >
                        REF: {b.bookingReference}
                      </span>
                      <span className={`badge ${statusBadges[b.status] || 'badge-category'}`}>
                        {b.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                      {b.vehicle?.brand} {b.vehicle?.name}
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        fontSize: '0.875rem',
                        color: 'var(--slate-600)',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--slate-400)', display: 'block', fontSize: '0.75rem' }}>
                          Pickup Date
                        </span>
                        <strong>{new Date(b.pickupDate).toLocaleDateString('en-IN')}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-400)', display: 'block', fontSize: '0.75rem' }}>
                          Return Date
                        </span>
                        <strong>{new Date(b.returnDate).toLocaleDateString('en-IN')}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-400)', display: 'block', fontSize: '0.75rem' }}>
                          Duration
                        </span>
                        <span>{b.rentalDays} Days</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--slate-400)', display: 'block', fontSize: '0.75rem' }}>
                          Booked On
                        </span>
                        <span>{new Date(b.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    {b.cancellationReason && (
                      <p
                        style={{
                          marginTop: '0.5rem',
                          fontSize: '0.8rem',
                          color: 'var(--danger)',
                          fontStyle: 'italic',
                        }}
                      >
                        Reason: {b.cancellationReason}
                      </p>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div
                    style={{
                      textAlign: 'right',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        Total Amount
                      </span>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={`/vehicles/${b.vehicle?._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Car Details
                      </Link>
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(b._id)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Booking Cancellation */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        title="Cancel Reservation?"
        message="Are you sure you wish to cancel this reservation? This action will free up the vehicle for other customers."
        confirmText="Yes, Cancel Booking"
        confirmVariant="btn-danger"
        isLoading={cancelLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />

      <style>{`
        @media (max-width: 840px) {
          .booking-record-card {
            grid-template-columns: 1fr !important;
          }
          .booking-record-card > div:last-child {
            text-align: left !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MyBookings;
