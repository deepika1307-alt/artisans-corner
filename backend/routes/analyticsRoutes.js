const express = require('express');
const router = express.Router();

const {
    getVendorAnalytics,
    getAdminAnalytics
} = require('../controllers/analyticsController');

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

// VENDOR ANALYTICS
router.get(
    '/vendor',
    protect,
    authorize('seller', 'admin'),
    getVendorAnalytics
);

// ADMIN ANALYTICS
router.get(
    '/admin',
    protect,
    authorize('admin'),
    getAdminAnalytics
);

module.exports = router;