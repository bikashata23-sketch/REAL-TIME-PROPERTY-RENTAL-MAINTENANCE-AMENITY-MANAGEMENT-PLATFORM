const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const MaintenanceRequest = require('../models/MaintenanceRequest');

// @desc    Submit a maintenance request
// @route   POST /api/maintenance
// @access  Private/Tenant
const createRequest = asyncHandler(async (req, res) => {
  const { property, issue } = req.body;

  if (!property || !issue) {
    throw new ApiError(400, 'Property and issue description are required');
  }

  const request = await MaintenanceRequest.create({
    property,
    tenant: req.user._id,
    issue,
  });

  const populated = await request.populate([
    { path: 'property', select: 'title address' },
    { path: 'tenant', select: 'name email' },
  ]);

  // Real-time: notify all connected clients (admins) a new request was created
  req.app.get('io')?.emit('maintenance:created', populated);

  res.status(201).json({ success: true, data: populated });
});

// @desc    Get maintenance requests
//          Admin -> all requests (filterable by status)
//          Tenant -> only their own requests
// @route   GET /api/maintenance?status=Pending&page=1&limit=10
// @access  Private
const getRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.user.role === 'tenant') filter.tenant = req.user._id;

  const [requests, total] = await Promise.all([
    MaintenanceRequest.find(filter)
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    MaintenanceRequest.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: requests,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// @desc    Update maintenance request status
// @route   PATCH /api/maintenance/:id/status
// @access  Private/Admin
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'In Progress', 'Completed'];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`);
  }

  const request = await MaintenanceRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  )
    .populate('property', 'title address')
    .populate('tenant', 'name email');

  if (!request) throw new ApiError(404, 'Maintenance request not found');

  // Real-time: notify all clients (tenant sees their status update live)
  req.app.get('io')?.emit('maintenance:updated', request);

  res.status(200).json({ success: true, data: request });
});

module.exports = { createRequest, getRequests, updateStatus };
