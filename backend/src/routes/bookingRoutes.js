const express = require('express');
const {
  createBooking,
  getBookings,
  cancelBooking,
  checkIn,
  checkOut,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getBookings).post(authorize('tenant'), createBooking);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/checkin', checkIn);
router.patch('/:id/checkout', checkOut);

module.exports = router;
