const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Amenity = require('../models/Amenity');

// @desc    Create amenity
// @route   POST /api/amenities
// @access  Private/Admin
const createAmenity = asyncHandler(async (req, res) => {
  const { name, description, available } = req.body;
  if (!name) throw new ApiError(400, 'Amenity name is required');

  const amenity = await Amenity.create({ name, description, available });
  res.status(201).json({ success: true, data: amenity });
});

// @desc    Get all amenities
// @route   GET /api/amenities
// @access  Private
const getAmenities = asyncHandler(async (req, res) => {
  const amenities = await Amenity.find().sort({ name: 1 });
  res.status(200).json({ success: true, data: amenities });
});

// @desc    Update amenity
// @route   PUT /api/amenities/:id
// @access  Private/Admin
const updateAmenity = asyncHandler(async (req, res) => {
  const amenity = await Amenity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!amenity) throw new ApiError(404, 'Amenity not found');
  res.status(200).json({ success: true, data: amenity });
});

// @desc    Delete amenity
// @route   DELETE /api/amenities/:id
// @access  Private/Admin
const deleteAmenity = asyncHandler(async (req, res) => {
  const amenity = await Amenity.findByIdAndDelete(req.params.id);
  if (!amenity) throw new ApiError(404, 'Amenity not found');
  res.status(200).json({ success: true, message: 'Amenity deleted successfully' });
});

module.exports = { createAmenity, getAmenities, updateAmenity, deleteAmenity };
