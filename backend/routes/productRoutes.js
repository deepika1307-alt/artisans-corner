const express = require('express');
const router = express.Router();

const {
    createProduct,
    getMyProducts,
    getAllProducts,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

// PUBLIC: GET ALL PRODUCTS
router.get('/', getAllProducts);

// SELLER: CREATE PRODUCT
router.post(
    '/create',
    protect,
    authorize('seller', 'admin'),
    createProduct
);

// SELLER: GET MY PRODUCTS
router.get(
    '/my-products',
    protect,
    authorize('seller', 'admin'),
    getMyProducts
);

// SELLER: UPDATE PRODUCT
router.put(
    '/:id',
    protect,
    authorize('seller', 'admin'),
    updateProduct
);

// SELLER: DELETE PRODUCT
router.delete(
    '/:id',
    protect,
    authorize('seller', 'admin'),
    deleteProduct
);

module.exports = router;