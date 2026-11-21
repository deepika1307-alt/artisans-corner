const Stripe = require('stripe');
const crypto = require('crypto');
const mongoose = require('mongoose');

const Product = require('../models/Product');

const stripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('Stripe secret key is not configured');
    }

    return Stripe(process.env.STRIPE_SECRET_KEY);
};

const createPaymentIntent = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Your cart is empty'
            });
        }

        // Validate and combine duplicate product IDs
        const quantities = new Map();

        for (const item of items) {
            const { productId, quantity } = item;

            if (
                !mongoose.Types.ObjectId.isValid(productId) ||
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {
                return res.status(400).json({
                    message: 'Invalid cart item'
                });
            }

            quantities.set(
                productId,
                (quantities.get(productId) || 0) + quantity
            );
        }

        const productIds = [...quantities.keys()];

        const products = await Product.find({
            _id: { $in: productIds }
        });

        if (products.length !== productIds.length) {
            return res.status(400).json({
                message: 'One or more products no longer exist'
            });
        }

        let totalAmount = 0;
        let totalCommission = 0;
        const vendorTotals = new Map();

        for (const product of products) {
            const quantity = quantities.get(
                product._id.toString()
            );

            if (product.stock < quantity) {
                return res.status(400).json({
                    message: `${product.productName} does not have enough stock`
                });
            }

            const subtotal = product.price * quantity;
            totalAmount += subtotal;

            const vendorId = product.vendor.toString();

            vendorTotals.set(
                vendorId,
                (vendorTotals.get(vendorId) || 0) + subtotal
            );
        }

        // Calculate the 5% platform commission
        for (const subtotal of vendorTotals.values()) {
            totalCommission += subtotal * 0.05;
        }

        totalAmount = Math.round(totalAmount * 100) / 100;
        totalCommission = Math.round(totalCommission * 100) / 100;

        if (totalAmount <= 0) {
            return res.status(400).json({
                message: 'Invalid payment amount'
            });
        }

        // Create a consistent cart hash for later order verification
        const normalizedCart = [...quantities.entries()]
            .map(([productId, quantity]) => ({
                productId,
                quantity
            }))
            .sort((a, b) =>
                a.productId.localeCompare(b.productId)
            );

        const cartHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(normalizedCart))
            .digest('hex');

        const paymentIntent = await stripe().paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'inr',
            payment_method_types: ['card'],
            metadata: {
                buyerId: buyerId.toString(),
                cartHash
            }
        });

        res.status(201).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            totalAmount,
            commission: totalCommission,
            vendorPayout: Math.round(
                (totalAmount - totalCommission) * 100
            ) / 100
        });

    } catch (error) {
        console.error('Create Payment Intent Error:', error.message);

        res.status(500).json({
            message: 'Unable to start payment'
        });
    }
};

module.exports = {
    createPaymentIntent
};