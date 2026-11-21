const express = require('express');
const router = express.Router();

// Order controllers
const {
    createOrder,
    createDemoOrder,
    simulatePayment,
    getMyOrders
} = require('../controllers/orderController');

// Authentication middleware
const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

// ========================================
// CREATE STRIPE ORDER
// ========================================

router.post(
    '/',
    protect,
    authorize('buyer', 'admin'),
    createOrder
);

// ========================================
// CREATE DEMO ORDER
// NO REAL PAYMENT
// ========================================

router.post(
    '/demo',
    protect,
    authorize('buyer'),
    createDemoOrder
);

// ========================================
// SIMULATED PAYMENT
// DEVELOPMENT OR ENABLED DEMO MODE
// ========================================

if (
    process.env.NODE_ENV !== 'production' ||
    process.env.DEMO_PAYMENTS_ENABLED === 'true'
) {
    router.post(
        '/:orderId/simulate-payment',
        protect,
        authorize('buyer'),
        simulatePayment
    );
}

// ========================================
// GET BUYER ORDERS
// ========================================

router.get(
    '/my-orders',
    protect,
    authorize('buyer', 'admin'),
    getMyOrders
);

module.exports = router;