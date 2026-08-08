const express = require('express');
const { createRequest, getRequests, updateStatus } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getRequests).post(authorize('tenant'), createRequest);
router.patch('/:id/status', authorize('admin', 'owner'), updateStatus);

module.exports = router;
