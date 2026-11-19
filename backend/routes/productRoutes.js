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

// PUBLIC: GET ALL PRODUCTS
router.get('/', getAllProducts);

// SELLER: GET MY PRODUCTS
// Keep this BEFORE /:id
router.get(
    '/my-products',
    protect,
    authorize('seller', 'admin'),
    getMyProducts
);

// PUBLIC: GET SINGLE PRODUCT
router.get('/:id', getProductById);

// SELLER: CREATE PRODUCT
router.post(
    '/create',
    protect,
    authorize('seller', 'admin'),
    createProduct
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