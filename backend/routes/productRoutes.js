const express = require('express');
const router = express.Router();

const {
    createProduct,
    getMyProducts,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

// GET ALL PRODUCTS (Public)
router.get('/', getAllProducts);

// GET MY PRODUCTS (Seller) - MUST be before /:id
router.get(
    '/my-products',
    protect,
    authorize('seller', 'admin'),
    getMyProducts
);

// CREATE PRODUCT (Seller)
router.post(
    '/create',
    protect,
    authorize('seller', 'admin'),
    createProduct
);

// GET SINGLE PRODUCT (Public) - keep after specific routes
router.get('/:id', getProductById);

// UPDATE PRODUCT (Seller)
router.put(
    '/:id',
    protect,
    authorize('seller', 'admin'),
    updateProduct
);

// DELETE PRODUCT (Seller)
router.delete(
    '/:id',
    protect,
    authorize('seller', 'admin'),
    deleteProduct
);

module.exports = router;