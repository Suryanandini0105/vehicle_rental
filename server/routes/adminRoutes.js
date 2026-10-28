const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.get('/users', getAllUsers);

module.exports = router;
