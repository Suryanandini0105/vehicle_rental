import React from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Gauge, Users, ChevronRight } from 'lucide-react';

const VehicleCard = ({ vehicle }) => {
  const {
    _id,
    name,
    brand,
    category,
    image,
    pricePerDay,
    fuelType,
    transmission,
    seats,
    status,
  } = vehicle;

  const isAvailable = status === 'Available';

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-img-wrapper">
        <img
          src={image}
          alt={`${brand} ${name}`}
          className="vehicle-card-img"
          loading="lazy"
          onError={(e) => {
            // Fallback reliable automobile image if external link is blocked
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="vehicle-badge-overlay">
          <span className="badge badge-category">{category}</span>
        </div>
        <div className="vehicle-price-overlay">
          ₹{pricePerDay.toLocaleString('en-IN')}{' '}
          <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>/day</span>
        </div>
      </div>

      <div className="vehicle-card-body">
        <div className="vehicle-card-header">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.2rem',
            }}
          >
            <span className="vehicle-card-brand">{brand}</span>
            <span
              className={`badge ${
                isAvailable ? 'badge-available' : 'badge-maintenance'
              }`}
            >
              {status}
            </span>
          </div>
          <h3 className="vehicle-card-title">{name}</h3>
        </div>

        <div className="vehicle-specs-pills">
          <div className="spec-pill" title="Fuel Type">
            <Fuel size={14} />
            <span>{fuelType}</span>
          </div>
          <div className="spec-pill" title="Transmission">
            <Gauge size={14} />
            <span>{transmission}</span>
          </div>
          <div className="spec-pill" title="Seating Capacity">
            <Users size={14} />
            <span>{seats} Seats</span>
          </div>
        </div>

        <div className="vehicle-card-footer">
          <Link
            to={`/vehicles/${_id}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            Details
          </Link>
          <Link
            to={`/vehicles/${_id}?book=true`}
            className={`btn btn-primary btn-sm ${
              !isAvailable ? 'disabled' : ''
            }`}
            style={{
              flex: 1.2,
              pointerEvents: !isAvailable ? 'none' : 'auto',
              opacity: !isAvailable ? 0.6 : 1,
            }}
          >
            Book Now <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
