const express = require('express');
const {
  createAmenity,
  getAmenities,
  updateAmenity,
  deleteAmenity,
} = require('../controllers/amenityController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getAmenities).post(authorize('admin', 'owner'), createAmenity);
router
  .route('/:id')
  .put(authorize('admin', 'owner'), updateAmenity)
  .delete(authorize('admin', 'owner'), deleteAmenity);

module.exports = router;
