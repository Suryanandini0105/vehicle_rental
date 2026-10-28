const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

/**
 * @desc    Get dashboard statistics for admin
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getAdminStats = async (req, res, next) => {
  try {
    const totalVehicles = await Vehicle.countDocuments({ isDeleted: false });
    const availableVehicles = await Vehicle.countDocuments({
      isDeleted: false,
      status: 'Available',
    });
    const maintenanceVehicles = await Vehicle.countDocuments({
      isDeleted: false,
      status: 'Maintenance',
    });

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Revenue aggregation (Confirmed and Completed bookings)
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['Confirmed', 'Completed'] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('vehicle', 'name brand category image registrationNumber pricePerDay')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // Category breakdown
    const categoryStats = await Vehicle.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalVehicles,
        availableVehicles,
        maintenanceVehicles,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalCustomers,
        totalRevenue,
      },
      categoryStats,
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings with filtering & search
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');

      // Search by booking reference directly or find matching users first
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { bookingReference: searchRegex },
        { user: { $in: userIds } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('vehicle', 'name brand category image registrationNumber pricePerDay')
      .populate('user', 'name email phone')
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
 * @desc    Update booking status (Confirm, Complete, Cancel) with state transition checks
 * @route   PATCH /api/admin/bookings/:id/status
 * @access  Private/Admin
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the new booking status.',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const currentStatus = booking.status;
    const nextStatus = status;

    // Define valid state transitions
    const validTransitions = {
      Pending: ['Confirmed', 'Cancelled'],
      Confirmed: ['Completed', 'Cancelled'],
      Completed: [], // Terminal state
      Cancelled: [], // Terminal state
    };

    if (currentStatus === nextStatus) {
      return res.status(400).json({
        success: false,
        message: `Booking is already in '${currentStatus}' status.`,
      });
    }

    const allowedNext = validTransitions[currentStatus] || [];
    if (!allowedNext.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: Cannot change booking from '${currentStatus}' to '${nextStatus}'.`,
      });
    }

    booking.status = nextStatus;

    if (nextStatus === 'Cancelled') {
      booking.cancelledAt = new Date();
      booking.cancelledBy = 'admin';
      booking.cancellationReason = reason
        ? reason.trim()
        : 'Cancelled by administrator';
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('vehicle', 'name brand category image registrationNumber pricePerDay')
      .populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${nextStatus}.`,
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all registered customers
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    // Aggregate booking counts per user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookingCount = await Booking.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          totalBookings: bookingCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
};
