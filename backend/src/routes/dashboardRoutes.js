const express = require('express');
const { getTenantDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/tenant', authorize('tenant'), getTenantDashboard);
router.get('/admin', authorize('admin'), getAdminDashboard);
// Owners see the same stats/charts as admins (properties, requests, bookings)
router.get('/owner', authorize('owner', 'admin'), getAdminDashboard);

module.exports = router;
