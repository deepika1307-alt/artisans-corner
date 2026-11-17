const express = require('express');
const router = express.Router();

const {
    createReview,
    getProductReviews
} = require('../controllers/reviewController');

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

// Submit a review (verified buyers only)
router.post(
    '/',
    protect,
    authorize('buyer', 'admin'),
    createReview
);

// Get reviews for a product (public)
router.get('/:productId', getProductReviews);

module.exports = router;