const express = require('express');
const router = express.Router();

const { createStore } = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

// Vendor onboarding route
router.post('/create', protect, createStore);

module.exports = router;