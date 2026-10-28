import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import ConfirmationModal from '../../components/ConfirmationModal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CarFront,
  X,
  Filter,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

const initialForm = {
  name: '',
  brand: '',
  category: 'SUV',
  image: '',
  description: '',
  pricePerDay: '',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  seats: 5,
  registrationNumber: '',
  status: 'Available',
};

const ManageVehicles = () => {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'new');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchVehicles = async () => {
    try {
      // Pass includeUnavailable=true to get maintenance/rented vehicles too
      const res = await api.get('/vehicles?includeUnavailable=true');
      if (res.data && res.data.vehicles) {
        setVehicles(res.data.vehicles);
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to fetch vehicles.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setEditingId(vehicle._id);
    setFormData({
      name: vehicle.name,
      brand: vehicle.brand,
      category: vehicle.category,
      image: vehicle.image,
      description: vehicle.description,
      pricePerDay: vehicle.pricePerDay,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      seats: vehicle.seats,
      registrationNumber: vehicle.registrationNumber,
      status: vehicle.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      if (editingId) {
        // Update existing vehicle
        const res = await api.put(`/vehicles/${editingId}`, formData);
        setAlert({
          type: 'success',
          text: `Updated "${formData.name}" successfully!`,
        });
        setVehicles((prev) =>
          prev.map((v) => (v._id === editingId ? res.data.vehicle : v))
        );
      } else {
        // Create new vehicle
        const res = await api.post('/vehicles', formData);
        setAlert({
          type: 'success',
          text: `Added new vehicle "${formData.name}" to fleet!`,
        });
        setVehicles([res.data.vehicle, ...vehicles]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Error processing vehicle request.'
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);

    try {
      await api.delete(`/vehicles/${deletingId}`);
      setAlert({
        type: 'success',
        text: 'Vehicle successfully removed from fleet.',
      });
      setVehicles((prev) => prev.filter((v) => v._id !== deletingId));
    } catch (err) {
      setAlert({
        type: 'danger',
        text: err.response?.data?.message || 'Could not delete vehicle.',
      });
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  // Filter vehicles by search term and category
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'All' || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
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
            Fleet Inventory
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Vehicle Management</h1>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} /> Add New Vehicle
        </button>
      </div>

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.text}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search & Filter Toolbar */}
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
            placeholder="Search by model, brand, or reg number..."
            style={{ paddingLeft: '2.4rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="form-control"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories ({vehicles.length})</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Electric">Electric</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner message="Fetching fleet records..." />
      ) : filteredVehicles.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--white)',
            padding: '3rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--slate-200)',
          }}
        >
          <CarFront size={48} style={{ color: 'var(--slate-400)', margin: '0 auto 1rem' }} />
          <h3>No Vehicles Found</h3>
          <p style={{ color: 'var(--slate-500)', marginTop: '0.5rem' }}>
            No vehicle records matched your search criteria.
          </p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Category</th>
                <th>Specs</th>
                <th>Reg #</th>
                <th>Rate/Day</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={v.image}
                        alt={v.name}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover',
                          backgroundColor: 'var(--slate-100)',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=100&q=80';
                        }}
                      />
                      <div>
                        <strong>{v.brand} {v.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-category">{v.category}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      {v.fuelType} • {v.transmission} • {v.seats}s
                    </span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {v.registrationNumber}
                    </code>
                  </td>
                  <td>
                    <strong>₹{v.pricePerDay.toLocaleString('en-IN')}</strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        v.status === 'Available'
                          ? 'badge-available'
                          : 'badge-maintenance'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenEditModal(v)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Vehicle"
                        style={{ padding: '0.4rem' }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(v._id)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Vehicle"
                        style={{ padding: '0.4rem' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem' }}>
                {editingId ? 'Edit Vehicle Information' : 'Add New Vehicle to Fleet'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div
                className="modal-body"
                style={{ maxHeight: '70vh', overflowY: 'auto' }}
              >
                {formError && (
                  <AlertMessage
                    type="danger"
                    message={formError}
                    onClose={() => setFormError('')}
                  />
                )}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Brand / Make</label>
                    <input
                      type="text"
                      name="brand"
                      className="form-control"
                      placeholder="e.g. Tata, Toyota, BMW"
                      value={formData.brand}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Model Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="e.g. Nexon EV Long Range"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      className="form-control"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="Hatchback">Hatchback</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Electric">Electric</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Daily Price (₹ INR)</label>
                    <input
                      type="number"
                      name="pricePerDay"
                      min={100}
                      className="form-control"
                      placeholder="e.g. 2500"
                      value={formData.pricePerDay}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Fuel</label>
                    <select
                      name="fuelType"
                      className="form-control"
                      value={formData.fuelType}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Transmission</label>
                    <select
                      name="transmission"
                      className="form-control"
                      value={formData.transmission}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Seats</label>
                    <input
                      type="number"
                      name="seats"
                      min={2}
                      max={12}
                      className="form-control"
                      value={formData.seats}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Registration Number</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      className="form-control"
                      placeholder="e.g. MH02EV4590"
                      value={formData.registrationNumber}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Status</label>
                    <select
                      name="status"
                      className="form-control"
                      value={formData.status}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Rented">Rented</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Highlights</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="form-control"
                    placeholder="Provide overview, features, safety rating, range..."
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? 'Saving...'
                    : editingId
                    ? 'Update Vehicle'
                    : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Remove Vehicle from Fleet?"
        message="Are you sure you want to delete this vehicle? If there are past completed bookings, the system will safely archive it to prevent record corruption."
        confirmText="Confirm Delete"
        confirmVariant="btn-danger"
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ManageVehicles;
