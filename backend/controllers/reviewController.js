const Review = require('../models/review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// CREATE REVIEW
const createReview = async (req, res) => {
    try {
        const buyerId = req.user?.id;
        const { productId, rating, comment } = req.body;

        if (!buyerId) {
            return res.status(401).json({
                message: 'Please log in as a buyer.'
            });
        }

        if (!productId || !rating || !comment?.trim()) {
            return res.status(400).json({
                message: 'Product, rating and comment are required.'
            });
        }

        if (
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                message: 'Rating must be between 1 and 5.'
            });
        }

        if (comment.trim().length < 3 || comment.trim().length > 500) {
            return res.status(400).json({
                message: 'Comment must contain 3 to 500 characters.'
            });
        }

        if (!require('mongoose').Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: 'Invalid product ID.'
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found.'
            });
        }

        // Check for a successfully paid order
        const previousOrder = await Order.findOne({
            buyer: buyerId,
            paymentStatus: 'paid',
            'items.product': productId
        });

        if (!previousOrder) {
            return res.status(403).json({
                message: 'Only buyers who have paid for this product can review it.'
            });
        }

        // Prevent duplicate reviews
        const existingReview = await Review.findOne({
            buyer: buyerId,
            product: productId
        });

        if (existingReview) {
            return res.status(400).json({
                message: 'You have already reviewed this product.'
            });
        }

        // Save review
        const review = await Review.create({
            product: productId,
            buyer: buyerId,
            rating: Number(rating),
            comment: comment.trim(),
            verifiedPurchase: true
        });

        return res.status(201).json({
            message: 'Review submitted successfully!',
            review
        });

    } catch (error) {
        console.error('Create Review Error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: 'You have already reviewed this product.'
            });
        }

        return res.status(500).json({
            message: 'Unable to submit review.'
        });
    }
};


// GET PRODUCT REVIEWS
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!require('mongoose').Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: 'Invalid product ID.'
            });
        }

        const reviews = await Review.find({
            product: productId
        })
            .populate('buyer', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: reviews.length,
            reviews
        });

    } catch (error) {
        console.error('Get Reviews Error:', error);

        return res.status(500).json({
            message: 'Unable to fetch reviews.'
        });
    }
};


module.exports = {
    createReview,
    getProductReviews
};