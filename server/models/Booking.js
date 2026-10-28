const mongoose = require('mongoose');

/**
 * Booking Lifecycle:
 * 1. PENDING: Initial state when customer creates a reservation request. Overlapping dates are reserved.
 * 2. CONFIRMED: Admin approves or auto-confirms reservation. Vehicle is locked for those dates.
 * 3. COMPLETED: Vehicle returned and rental concluded.
 * 4. CANCELLED: Cancelled by customer (before pickup) or by Admin. Dates freed.
 *
 * Conflict Logic:
 * A vehicle is unavailable for date range [P1, R1] if there is any booking for that vehicle
 * with status in ['Pending', 'Confirmed'] where:
 *   existingBooking.pickupDate < R1 AND existingBooking.returnDate > P1
 */

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
      index: true,
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required'],
      index: true,
    },
    returnDate: {
      type: Date,
      required: [true, 'Return date is required'],
      index: true,
    },
    rentalDays: {
      type: Number,
      required: [true, 'Rental duration in days is required'],
      min: [1, 'Rental duration must be at least 1 day'],
    },
    pricePerDayAtBooking: {
      type: Number,
      required: [true, 'Historical price per day is required'],
      min: [0, 'Daily price must be non-negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total rental amount is required'],
      min: [0, 'Total amount must be non-negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'Pending',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'admin', null],
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast conflict checking
bookingSchema.index({ vehicle: 1, status: 1, pickupDate: 1, returnDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
