const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Booking = require('../models/Booking');
const Amenity = require('../models/Amenity');

/** Converts 'HH:mm' to minutes since midnight for easy numeric comparison. */
const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Checks whether [startTime, endTime) overlaps any existing active booking
 * for the same amenity on the same date.
 * Two ranges overlap when: existingStart < newEnd AND existingEnd > newStart
 */
const hasConflict = async (amenityId, date, startTime, endTime, excludeBookingId = null) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    amenity: amenityId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'Cancelled' },
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const existingBookings = await Booking.find(query);

  const newStart = toMinutes(startTime);
  const newEnd = toMinutes(endTime);

  return existingBookings.some((b) => {
    const existingStart = toMinutes(b.startTime);
    const existingEnd = toMinutes(b.endTime);
    return existingStart < newEnd && existingEnd > newStart;
  });
};

// @desc    Create a booking (with conflict prevention)
// @route   POST /api/bookings
// @access  Private/Tenant
const createBooking = asyncHandler(async (req, res) => {
  const { amenity, date, startTime, endTime } = req.body;

  if (!amenity || !date || !startTime || !endTime) {
    throw new ApiError(400, 'Amenity, date, startTime and endTime are required');
  }

  if (toMinutes(startTime) >= toMinutes(endTime)) {
    throw new ApiError(400, 'Start time must be before end time');
  }

  const amenityDoc = await Amenity.findById(amenity);
  if (!amenityDoc) throw new ApiError(404, 'Amenity not found');
  if (!amenityDoc.available) throw new ApiError(400, 'This amenity is currently unavailable');

  const conflict = await hasConflict(amenity, date, startTime, endTime);
  if (conflict) {
    throw new ApiError(409, 'This amenity is already booked for the selected time slot');
  }

  const booking = await Booking.create({
    amenity,
    tenant: req.user._id,
    date,
    startTime,
    endTime,
  });

  const populated = await booking.populate([
    { path: 'amenity', select: 'name' },
    { path: 'tenant', select: 'name email' },
  ]);

  req.app.get('io')?.emit('booking:created', populated);

  res.status(201).json({ success: true, data: populated });
});

// @desc    Get bookings
//          Admin/Owner -> all bookings, Tenant -> own bookings
//          Supports ?date=YYYY-MM-DD and ?amenity=<id> so owners/admins can
//          check whether a given amenity is already booked on a given date.
// @route   GET /api/bookings?status=Confirmed&date=2026-08-10&amenity=<id>&page=1&limit=10
// @access  Private
const getBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.amenity) filter.amenity = req.query.amenity;
  if (req.query.date) {
    const startOfDay = new Date(req.query.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(req.query.date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.date = { $gte: startOfDay, $lte: endOfDay };
  }
  if (req.user.role === 'tenant') filter.tenant = req.user._id;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('amenity', 'name')
      .populate('tenant', 'name email')
      .sort({ date: -1, startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// @desc    Cancel a booking (tenant can cancel own; admin can cancel any)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  const isOwner = booking.tenant.toString() === req.user._id.toString();
  if (!['admin', 'owner'].includes(req.user.role) && !isOwner) {
    throw new ApiError(403, 'You are not authorized to cancel this booking');
  }

  booking.status = 'Cancelled';
  await booking.save();

  const populated = await booking.populate([
    { path: 'amenity', select: 'name' },
    { path: 'tenant', select: 'name email' },
  ]);

  req.app.get('io')?.emit('booking:cancelled', populated);

  res.status(200).json({ success: true, data: populated });
});

// @desc    Record check-in / check-out timestamps
// @route   PATCH /api/bookings/:id/checkin  |  /api/bookings/:id/checkout
// @access  Private
const recordCheckInOut = (field) =>
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, 'Booking not found');

    const isOwner = booking.tenant.toString() === req.user._id.toString();
    if (!['admin', 'owner'].includes(req.user.role) && !isOwner) {
      throw new ApiError(403, 'You are not authorized to update this booking');
    }

    booking[field] = new Date();
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  });

module.exports = {
  createBooking,
  getBookings,
  cancelBooking,
  checkIn: recordCheckInOut('checkIn'),
  checkOut: recordCheckInOut('checkOut'),
};
