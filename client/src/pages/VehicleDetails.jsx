import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import {
  Fuel,
  Gauge,
  Users,
  Shield,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Car,
  FileCheck,
} from 'lucide-react';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Form State
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/vehicles/${id}`);
        if (res.data && res.data.vehicle) {
          setVehicle(res.data.vehicle);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 'Vehicle details could not be found.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  // Calculate rental duration in days
  const calculateDays = () => {
    if (!pickupDate || !returnDate) return 0;
    const pDate = new Date(pickupDate);
    const rDate = new Date(returnDate);
    if (rDate <= pDate) return 0;
    const diffTime = Math.abs(rDate - pDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const rentalDays = calculateDays();
  const totalCost = vehicle ? rentalDays * vehicle.pricePerDay : 0;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!pickupDate || !returnDate) {
      setBookingError('Please specify both pickup date and return date.');
      return;
    }

    if (new Date(returnDate) <= new Date(pickupDate)) {
      setBookingError('Return date must be strictly after pickup date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        vehicleId: vehicle._id,
        pickupDate,
        returnDate,
        notes,
      });

      if (res.data && res.data.booking) {
        setBookingSuccess(res.data.booking);
      }
    } catch (err) {
      setBookingError(
        err.response?.data?.message ||
          'Failed to reserve vehicle. It may already be booked for these dates.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving vehicle specifications..." />;
  }

  if (error || !vehicle) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: 500, margin: '0 auto' }}>
          {error || 'Vehicle not found.'}
        </div>
        <Link to="/vehicles" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Browse
        </Link>
      </div>
    );
  }

  // If booking successfully created, display confirmed summary dialog
  if (bookingSuccess) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div
          style={{
            maxWidth: 600,
            margin: '0 auto',
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            border: '1px solid var(--slate-200)',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Reservation Request Placed!
          </h2>
          <p style={{ color: 'var(--slate-500)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Your booking reference has been registered with our fleet depot.
          </p>

          <div
            style={{
              backgroundColor: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              fontSize: '0.9rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Booking Reference:</span>
              <strong style={{ color: 'var(--primary)', letterSpacing: '0.05em' }}>
                {bookingSuccess.bookingReference}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Car Reserved:</span>
              <span style={{ fontWeight: 600 }}>
                {vehicle.brand} {vehicle.name}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Pickup Date:</span>
              <span>{new Date(bookingSuccess.pickupDate).toLocaleDateString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Return Date:</span>
              <span>{new Date(bookingSuccess.returnDate).toLocaleDateString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Duration:</span>
              <span>{bookingSuccess.rentalDays} Days</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--slate-200)',
                paddingTop: '0.6rem',
                marginTop: '0.3rem',
              }}
            >
              <strong style={{ color: 'var(--navy-900)' }}>Total Rental Payable:</strong>
              <strong style={{ color: 'var(--navy-900)', fontSize: '1.1rem' }}>
                ₹{bookingSuccess.totalAmount.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#eff6ff',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '2rem',
              fontSize: '0.85rem',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textAlign: 'left',
            }}
          >
            <FileCheck size={18} style={{ flexShrink: 0 }} />
            <span>
              This is a confirmed reservation. Payment is settled on vehicle handover without any
              upfront transaction fees.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/my-bookings" className="btn btn-primary">
              View In My Bookings
            </Link>
            <Link to="/vehicles" className="btn btn-secondary">
              Browse More Cars
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Back Link */}
        <Link
          to="/vehicles"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--slate-500)',
            fontWeight: 500,
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Vehicle Catalog
        </Link>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 0.9fr',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Image & Vehicle Specs */}
          <div>
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--slate-200)',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <img
                src={vehicle.image}
                alt={`${vehicle.brand} ${vehicle.name}`}
                style={{
                  width: '100%',
                  height: '420px',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80';
                }}
              />
            </div>

            {/* Vehicle Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                <span className="badge badge-category">{vehicle.category}</span>
                <span
                  className={`badge ${
                    vehicle.status === 'Available'
                      ? 'badge-available'
                      : 'badge-maintenance'
                  }`}
                >
                  {vehicle.status}
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--slate-400)',
                    marginLeft: 'auto',
                  }}
                >
                  Reg No: <strong>{vehicle.registrationNumber}</strong>
                </span>
              </div>
              <h1 style={{ fontSize: '2.25rem' }}>
                {vehicle.brand} {vehicle.name}
              </h1>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem' }}>
                Vehicle Overview
              </h3>
              <p
                style={{
                  color: 'var(--slate-600)',
                  lineHeight: 1.7,
                  fontSize: '0.95rem',
                }}
              >
                {vehicle.description}
              </p>
            </div>

            {/* Key Specifications Grid */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>
                Technical Specifications
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--white)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <Fuel size={22} style={{ color: 'var(--primary)' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      Fuel Type
                    </span>
                    <p style={{ fontWeight: 600 }}>{vehicle.fuelType}</p>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--white)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <Gauge size={22} style={{ color: 'var(--primary)' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      Transmission
                    </span>
                    <p style={{ fontWeight: 600 }}>{vehicle.transmission}</p>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--white)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <Users size={22} style={{ color: 'var(--primary)' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      Seating Capacity
                    </span>
                    <p style={{ fontWeight: 600 }}>{vehicle.seats} Adults</p>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--white)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <Shield size={22} style={{ color: 'var(--success)' }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      Insurance
                    </span>
                    <p style={{ fontWeight: 600 }}>Fully Insured</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Booking Box */}
          <div style={{ position: 'sticky', top: '96px' }}>
            <div
              style={{
                backgroundColor: 'var(--white)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {/* Price header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid var(--slate-100)',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
                    Daily Rental Rate
                  </span>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: 'var(--navy-900)',
                    }}
                  >
                    ₹{vehicle.pricePerDay.toLocaleString('en-IN')}
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--slate-500)' }}>
                      {' '}
                      / day
                    </span>
                  </div>
                </div>
                <span className="badge badge-success">Free Cancellation</span>
              </div>

              {bookingError && (
                <AlertMessage
                  type="danger"
                  message={bookingError}
                  onClose={() => setBookingError('')}
                />
              )}

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label className="form-label">Pickup Date</label>
                  <input
                    type="date"
                    className="form-control"
                    min={todayStr}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Return Date</label>
                  <input
                    type="date"
                    className="form-control"
                    min={pickupDate || todayStr}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Requests / Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="e.g. airport pickup, child booster seat, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Rental Cost Calculation Preview */}
                {rentalDays > 0 && (
                  <div
                    style={{
                      backgroundColor: 'var(--slate-50)',
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <span style={{ color: 'var(--slate-500)' }}>
                        ₹{vehicle.pricePerDay.toLocaleString('en-IN')} × {rentalDays} days
                      </span>
                      <span>₹{totalCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <span style={{ color: 'var(--slate-500)' }}>Taxes & Insurance</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>Included</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--slate-200)',
                        paddingTop: '0.5rem',
                        marginTop: '0.4rem',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                      }}
                    >
                      <span>Estimated Total</span>
                      <span style={{ color: 'var(--primary)' }}>
                        ₹{totalCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit / Login Button */}
                {user ? (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', height: '46px', fontSize: '1rem' }}
                    disabled={submitting || vehicle.status !== 'Available'}
                  >
                    {submitting ? 'Confirming Reservation...' : 'Reserve This Vehicle'}
                  </button>
                ) : (
                  <div>
                    <Link
                      to="/login"
                      state={{ from: location }}
                      className="btn btn-primary"
                      style={{ width: '100%', height: '46px', fontSize: '1rem' }}
                    >
                      Log In to Reserve Vehicle
                    </Link>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--slate-400)',
                        textAlign: 'center',
                        marginTop: '0.5rem',
                      }}
                    >
                      New customer? Registration takes less than 30 seconds.
                    </p>
                  </div>
                )}
              </form>

              {/* Guarantees */}
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--slate-100)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.825rem',
                  color: 'var(--slate-500)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                  <span>No credit card needed to reserve</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                  <span>Free cancellation before scheduled pickup</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                  <span>Strict sanitization protocol verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VehicleDetails;
