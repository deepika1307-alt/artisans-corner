const express = require('express');
const router = express.Router();

const { uploadImage } = require('../controllers/imageController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post(
    '/upload',
    protect,
    authorize('seller', 'admin'),
    upload.single('image'),
    uploadImage
);

module.exports = router;