const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser
} = require('../controllers/authController');

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');


// USER REGISTRATION
router.post('/register', registerUser);


// USER LOGIN
router.post('/login', loginUser);


// PROTECTED USER PROFILE
router.get('/profile', protect, (req, res) => {
    res.status(200).json({
        message: "Welcome! You are authenticated.",
        user: req.user
    });
});


// SELLER-ONLY TEST ROUTE
router.get(
    '/seller-test',
    protect,
    authorize('seller', 'admin'),
    (req, res) => {
        res.status(200).json({
            message: "Seller access granted!",
            user: req.user
        });
    }
);


module.exports = router;