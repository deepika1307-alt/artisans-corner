const express = require('express');
const router = express.Router();

// Order controllers
const {
    createOrder,
    simulatePayment,
    getMyOrders
} = require('../controllers/orderController');

// Authentication middleware
const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

// ========================================
// CREATE ORDER
// ========================================

router.post(
    '/',
    protect,
    authorize('buyer', 'admin'),
    createOrder
);

// ========================================
// SIMULATED PAYMENT
// DEVELOPMENT ONLY
// ========================================

if (process.env.NODE_ENV !== 'production') {
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