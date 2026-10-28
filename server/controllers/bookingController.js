const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

/**
 * Generate a clean, readable reference code: e.g., DE-2026-A8F2K
 */
const generateBookingReference = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  for (let i = 0; i < 5; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `DE-${year}-${randomCode}`;
};

/**
 * @desc    Create a new vehicle booking/reservation
 * @route   POST /api/bookings
 * @access  Private (Customer)
 */
const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, returnDate, notes } = req.body;

    if (!vehicleId || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicle ID, pickup date, and return date.',
      });
    }

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    // Validate date parsing
    if (isNaN(pickup.getTime()) || isNaN(returnD.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided for pickup or return date.',
      });
    }

    // Check past dates (normalized to beginning of current day in local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pickupNormalized = new Date(pickup);
    pickupNormalized.setHours(0, 0, 0, 0);

    if (pickupNormalized < today) {
      return res.status(400).json({
        success: false,
        message: 'Pickup date cannot be in the past.',
      });
    }

    // Ensure returnDate is later than pickupDate
    if (returnD <= pickup) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be later than the pickup date.',
      });
    }

    // Calculate rental days (minimum 1 day)
    const diffTime = Math.abs(returnD - pickup);
    const rentalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Verify vehicle existence and active status
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      isDeleted: false,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Selected vehicle is not available in our fleet.',
      });
    }

    if (vehicle.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `This vehicle is currently marked as '${vehicle.status}' and cannot be reserved.`,
      });
    }

    // Check for overlapping confirmed or pending bookings
    // Condition: existingBooking.pickupDate < returnD AND existingBooking.returnDate > pickup
    const conflictingBooking = await Booking.findOne({
      vehicle: vehicle._id,
      status: { $in: ['Pending', 'Confirmed'] },
      pickupDate: { $lt: returnD },
      returnDate: { $gt: pickup },
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message:
          'This vehicle is already booked or reserved for the selected date range. Please select different dates or another vehicle.',
      });
    }

    // Server-side calculation of total amount (never trusted from frontend)
    const pricePerDayAtBooking = vehicle.pricePerDay;
    const totalAmount = rentalDays * pricePerDayAtBooking;

    // Generate unique booking reference with retry for collision safety
    let bookingReference = generateBookingReference();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const existingRef = await Booking.findOne({ bookingReference });
      if (!existingRef) {
        isUnique = true;
      } else {
        bookingReference = generateBookingReference();
        attempts++;
      }
    }

    const booking = await Booking.create({
      bookingReference,
      user: req.user.id,
      vehicle: vehicle._id,
      pickupDate: pickup,
      returnDate: returnD,
      rentalDays,
      pricePerDayAtBooking,
      totalAmount,
      status: 'Pending',
      notes: notes ? notes.trim() : '',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('vehicle', 'name brand category image pricePerDay fuelType transmission seats registrationNumber')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Reservation placed successfully! Your booking is pending confirmation.',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bookings of the currently logged-in customer
 * @route   GET /api/bookings/my
 * @access  Private (Customer)
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('vehicle', 'name brand category image pricePerDay fuelType transmission seats registrationNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get booking details by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle', 'name brand category image pricePerDay fuelType transmission seats registrationNumber')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found.',
      });
    }

    // Only booking owner or admin can view
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking.',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking (Customer or Admin)
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found.',
      });
    }

    // Role check: must be owner or admin
    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking.',
      });
    }

    // Check if booking is already terminal
    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
    }

    if (booking.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed rentals cannot be cancelled.',
      });
    }

    // Customer cancellation rule: pickup date must be in the future
    if (isOwner && !isAdmin) {
      const now = new Date();
      if (new Date(booking.pickupDate) <= now && booking.status === 'Confirmed') {
        return res.status(400).json({
          success: false,
          message:
            'Bookings that are active or past their pickup date cannot be cancelled online. Please contact support.',
        });
      }
    }

    booking.status = 'Cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user.role;
    booking.cancellationReason = req.body.reason
      ? req.body.reason.trim()
      : isOwner
      ? 'Cancelled by customer'
      : 'Cancelled by administrator';

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('vehicle', 'name brand category image pricePerDay')
      .populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Booking has been successfully cancelled.',
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
