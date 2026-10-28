import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Calendar,
  CarFront,
} from 'lucide-react';

const BrowseVehicles = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || 'All');
  const [transmission, setTransmission] = useState(
    searchParams.get('transmission') || 'All'
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [pickupDate, setPickupDate] = useState(searchParams.get('pickupDate') || '');
  const [returnDate, setReturnDate] = useState(searchParams.get('returnDate') || '');

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch vehicles whenever filter triggers
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError('');

      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (category && category !== 'All') queryParams.append('category', category);
        if (fuelType && fuelType !== 'All') queryParams.append('fuelType', fuelType);
        if (transmission && transmission !== 'All')
          queryParams.append('transmission', transmission);
        if (sort) queryParams.append('sort', sort);
        if (pickupDate && returnDate) {
          queryParams.append('pickupDate', pickupDate);
          queryParams.append('returnDate', returnDate);
        }

        const res = await api.get(`/vehicles?${queryParams.toString()}`);
        if (res.data && res.data.vehicles) {
          setVehicles(res.data.vehicles);
        }
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
        setError('Failed to load fleet catalog. Please check server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [search, category, fuelType, transmission, sort, pickupDate, returnDate]);

  // Clear all filters
  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setFuelType('All');
    setTransmission('All');
    setSort('newest');
    setPickupDate('');
    setReturnDate('');
    setSearchParams({});
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            DriveEase Fleet
          </span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.25rem' }}>
            Browse Available Vehicles
          </h1>
          <p style={{ color: 'var(--slate-500)', marginTop: '0.4rem', fontSize: '1rem' }}>
            Choose from economy hatchbacks to high-end luxury SUVs and cutting-edge electric cars.
          </p>
        </div>

        {/* Filters Card */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Top Search & Sort Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--slate-400)',
                }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search by vehicle name or brand (e.g. Tata, Creta)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <SlidersHorizontal size={18} style={{ color: 'var(--slate-400)' }} />
              <select
                className="form-control"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Sort By: Newest Additions</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Vehicle Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Filter Pills / Dropdowns Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            {/* Category */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: 2 }}>
                Category
              </label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Electric">Electric (EV)</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: 2 }}>
                Fuel Type
              </label>
              <select
                className="form-control"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              >
                <option value="All">All Fuels</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: 2 }}>
                Transmission
              </label>
              <select
                className="form-control"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                <option value="All">All Transmissions</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>

            {/* Availability Filter Dates */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: 2 }}>
                Pickup Date
              </label>
              <input
                type="date"
                className="form-control"
                min={todayStr}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: 2 }}>
                Return Date
              </label>
              <input
                type="date"
                className="form-control"
                min={pickupDate || todayStr}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>

            {/* Reset Button */}
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary"
                style={{ width: '100%', height: '42px', marginTop: 'auto' }}
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ color: 'var(--slate-600)', fontSize: '0.925rem' }}>
            Showing{' '}
            <strong style={{ color: 'var(--navy-900)' }}>{vehicles.length}</strong> vehicles
            {pickupDate && returnDate && (
              <span style={{ color: 'var(--primary)', marginLeft: 6 }}>
                available between {pickupDate} and {returnDate}
              </span>
            )}
          </p>
        </div>

        {/* Main Fleet Display */}
        {loading ? (
          <LoadingSpinner message="Searching verified vehicles..." />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : vehicles.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'var(--white)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)',
            }}
          >
            <CarFront size={56} style={{ color: 'var(--slate-400)', margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
              No Vehicles Matched Your Filter
            </h3>
            <p style={{ color: 'var(--slate-500)', maxWidth: 460, margin: '0 auto 1.5rem' }}>
              Try removing some search parameters, clearing your selected dates, or switching categories.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
              <RotateCcw size={16} /> Clear All Filters
            </button>
          </div>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseVehicles;
