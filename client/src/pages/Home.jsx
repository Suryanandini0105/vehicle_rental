import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Calendar,
  Shield,
  Zap,
  Sparkles,
  Award,
  ChevronRight,
  CheckCircle2,
  Clock,
  CarFront,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Search Form State
  const [searchCategory, setSearchCategory] = useState('All');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles?sort=newest');
        if (res.data && res.data.vehicles) {
          setFeaturedVehicles(res.data.vehicles.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load featured vehicles:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCategory !== 'All') params.append('category', searchCategory);
    if (pickupDate) params.append('pickupDate', pickupDate);
    if (returnDate) params.append('returnDate', returnDate);
    navigate(`/vehicles?${params.toString()}`);
  };

  // Default minimum date is today in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-tag">
                <Sparkles size={16} /> Premium Self-Drive Rentals in India
              </div>
              <h1 className="hero-title">
                Drive With <span>Confidence</span>, Arrive With Ease.
              </h1>
              <p className="hero-subtitle">
                Rent top-rated SUVs, electric vehicles, sedans, and luxury cars at
                transparent daily rates. Unlimited kilometers, zero hidden fees, and
                instant confirmed reservations.
              </p>

              <div className="hero-cta">
                <Link to="/vehicles" className="btn btn-primary btn-lg">
                  Explore All Cars <ChevronRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Customer Sign In
                </Link>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  marginTop: '2.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div>
                  <h4 style={{ color: 'var(--white)', fontSize: '1.5rem', fontWeight: 800 }}>
                    100%
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Verified Fleet</p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--white)', fontSize: '1.5rem', fontWeight: 800 }}>
                    ₹0
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Hidden Charges</p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--white)', fontSize: '1.5rem', fontWeight: 800 }}>
                    24/7
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Roadside Support</p>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="hero-card-preview">
              <img
                src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1000&q=80"
                alt="Tata Nexon EV featured car"
              />
              <div
                style={{
                  marginTop: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      color: '#60a5fa',
                      fontWeight: 700,
                    }}
                  >
                    Featured EV
                  </span>
                  <h3 style={{ color: 'var(--white)', fontSize: '1.2rem', marginTop: 2 }}>
                    Tata Nexon EV Long Range
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Starting at</span>
                  <p
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: 'var(--white)',
                    }}
                  >
                    ₹2,800<span style={{ fontSize: '0.75rem', fontWeight: 400 }}>/day</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Container */}
      <div className="container">
        <div className="quick-search-box">
          <form onSubmit={handleQuickSearch}>
            <div className="search-grid">
              {/* Category */}
              <div>
                <label className="form-label">Vehicle Category</label>
                <select
                  className="form-control"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Electric">Electric Vehicle</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>

              {/* Pickup Date */}
              <div>
                <label className="form-label">Pickup Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={todayStr}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>

              {/* Return Date */}
              <div>
                <label className="form-label">Return Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={pickupDate || todayStr}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '42px' }}
                >
                  <Search size={18} /> Search Cars
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Featured Vehicles Grid */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
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
                Top Recommendations
              </span>
              <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>
                Featured Fleet
              </h2>
            </div>
            <Link
              to="/vehicles"
              style={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              View Full Fleet <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading popular vehicles..." />
          ) : featuredVehicles.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--slate-200)',
              }}
            >
              <CarFront size={48} style={{ color: 'var(--slate-400)', margin: '0 auto 1rem' }} />
              <h3>Fleet is being prepared</h3>
              <p style={{ color: 'var(--slate-500)', marginTop: '0.5rem' }}>
                Run the database seed script to view the 8+ included vehicles.
              </p>
            </div>
          ) : (
            <div className="vehicle-grid">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose DriveEase */}
      <section
        style={{
          backgroundColor: 'var(--white)',
          padding: '5rem 0',
          borderTop: '1px solid var(--slate-200)',
          borderBottom: '1px solid var(--slate-200)',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 3.5rem' }}>
            <span
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              The DriveEase Advantage
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.25rem' }}>
              Why Thousands of Travelers Trust Us
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Shield size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>
                All-Inclusive Insurance
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Every reservation includes comprehensive damage cover and zero hidden liability
                terms for total peace of mind on the road.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ecfdf5',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Zap size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>
                Instant Confirmation
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                No waiting around for approvals. Our live conflict detection locks your dates
                and immediately gives you a reference ID.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fffbeb',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>
                Flexible Cancellation
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Change of plans? Cancel your upcoming reservation right from your customer
                dashboard before pickup time without penalty.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>
                Sanitized & Inspected
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Every car undergoes a multi-point safety checklist, tire depth check, and deep
                interior sanitization before handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 3.5rem' }}>
            <span
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Simple Process
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.25rem' }}>
              Rent in 3 Seamless Steps
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              position: 'relative',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--navy-900)',
                  color: 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  margin: '0 auto 1.5rem',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Select Your Vehicle
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Browse our wide selection of Hatchbacks, Sedans, Luxury cars, and Electric vehicles.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  margin: '0 auto 1.5rem',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Pick Rental Dates
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Choose pickup & return schedules. Our server calculates the total cost and prevents
                double-bookings.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--navy-900)',
                  color: 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  margin: '0 auto 1.5rem',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Hit the Open Road
              </h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Receive your unique booking reference, collect the keys, and enjoy an unforgettable
                journey!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
