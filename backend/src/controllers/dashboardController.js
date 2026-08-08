const asyncHandler = require('../utils/asyncHandler');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Booking = require('../models/Booking');
const Property = require('../models/Property');

// @desc    Tenant dashboard summary
// @route   GET /api/dashboard/tenant
// @access  Private/Tenant
const getTenantDashboard = asyncHandler(async (req, res) => {
  const tenantId = req.user._id;

  const [totalRequests, activeRequests, completedRequests, upcomingBookings] = await Promise.all([
    MaintenanceRequest.countDocuments({ tenant: tenantId }),
    MaintenanceRequest.countDocuments({ tenant: tenantId, status: { $in: ['Pending', 'In Progress'] } }),
    MaintenanceRequest.countDocuments({ tenant: tenantId, status: 'Completed' }),
    Booking.countDocuments({ tenant: tenantId, status: 'Confirmed', date: { $gte: new Date() } }),
  ]);

  res.status(200).json({
    success: true,
    data: { totalRequests, activeRequests, completedRequests, upcomingBookings },
  });
});

// @desc    Admin dashboard summary + chart data
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalProperties, totalRequests, pendingRequests, completedRequests, activeBookings] =
    await Promise.all([
      Property.countDocuments(),
      MaintenanceRequest.countDocuments(),
      MaintenanceRequest.countDocuments({ status: 'Pending' }),
      MaintenanceRequest.countDocuments({ status: 'Completed' }),
      Booking.countDocuments({ status: 'Confirmed' }),
    ]);

  // Chart 1: Maintenance requests grouped by status
  const maintenanceByStatus = await MaintenanceRequest.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Chart 2: Bookings grouped by amenity
  const bookingsPerAmenity = await Booking.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $group: { _id: '$amenity', count: { $sum: 1 } } },
    { $lookup: { from: 'amenities', localField: '_id', foreignField: '_id', as: 'amenity' } },
    { $unwind: '$amenity' },
    { $project: { _id: 0, name: '$amenity.name', count: 1 } },
  ]);

  // Chart 3: Maintenance requests created per month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRequests = await MaintenanceRequest.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: { totalProperties, totalRequests, pendingRequests, completedRequests, activeBookings },
      charts: {
        maintenanceByStatus: maintenanceByStatus.map((m) => ({ status: m._id, count: m.count })),
        bookingsPerAmenity,
        monthlyRequests: monthlyRequests.map((m) => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
          count: m.count,
        })),
      },
    },
  });
});

module.exports = { getTenantDashboard, getAdminDashboard };
