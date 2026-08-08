const express = require('express');
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // all property routes require authentication

router.route('/').get(getProperties).post(authorize('admin', 'owner'), createProperty);

router
  .route('/:id')
  .get(getProperty)
  .put(authorize('admin', 'owner'), updateProperty)
  .delete(authorize('admin', 'owner'), deleteProperty);

module.exports = router;
