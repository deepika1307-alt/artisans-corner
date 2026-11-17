const express = require('express');
const router = express.Router();

const {
    createOrder,
    simulatePayment,
    getMyOrders
} = require('../controllers/orderController');

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

// Create order
router.post(
    '/',
    protect,
    authorize('buyer', 'admin'),
    createOrder
);

// Simulated payment (development demo only)
// Enable simulated payments only during development
if (process.env.NODE_ENV !== 'production') {
    router.post(
        '/:orderId/simulate-payment',
        protect,
        authorize('buyer'),
        simulatePayment
    );
}

// Get buyer orders
router.get(
    '/my-orders',
    protect,
    authorize('buyer', 'admin'),
    getMyOrders
);

module.exports = router;