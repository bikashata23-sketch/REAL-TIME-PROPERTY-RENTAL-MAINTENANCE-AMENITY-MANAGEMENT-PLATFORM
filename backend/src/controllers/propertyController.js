const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Property = require('../models/Property');

// @desc    Create a property
// @route   POST /api/properties
// @access  Private/Admin
const createProperty = asyncHandler(async (req, res) => {
  const { title, address, description } = req.body;

  if (!title || !address) {
    throw new ApiError(400, 'Title and address are required');
  }

  const property = await Property.create({
    title,
    address,
    description,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: property });
});

// @desc    Get all properties (paginated, searchable)
// @route   GET /api/properties?page=1&limit=10&search=xyz
// @access  Private
const getProperties = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || '';

  const filter = search
    ? { $or: [{ title: { $regex: search, $options: 'i' } }, { address: { $regex: search, $options: 'i' } }] }
    : {};

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Property.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: properties,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Private
const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');
  res.status(200).json({ success: true, data: property });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private/Admin
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!property) throw new ApiError(404, 'Property not found');
  res.status(200).json({ success: true, data: property });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private/Admin
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');
  res.status(200).json({ success: true, message: 'Property deleted successfully' });
});

module.exports = { createProperty, getProperties, getProperty, updateProperty, deleteProperty };
