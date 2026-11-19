const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// ========================================
// CREATE ORDER WITH STOCK DEDUCTION
// ========================================

const createOrder = async (req, res) => {
    let session;

    try {
        const buyerId = req.user?.id;
        const { items, shippingAddress } = req.body;

        if (!buyerId) {
            return res.status(401).json({
                message: 'Buyer authentication required.'
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Your cart is empty.'
            });
        }

        const requiredFields = [
            'fullName', 'phone', 'address',
            'city', 'state', 'pincode'
        ];

        for (const field of requiredFields) {
            if (!shippingAddress?.[field]?.toString().trim()) {
                return res.status(400).json({
                    message: `Please provide ${field}.`
                });
            }
        }

        // COMBINE DUPLICATE PRODUCTS
        const quantities = new Map();

        for (const item of items) {
            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    message: 'Invalid quantity.'
                });
            }

            if (!mongoose.Types.ObjectId.isValid(item.productId)) {
                return res.status(400).json({
                    message: 'Invalid product ID.'
                });
            }

            const id = item.productId.toString();

            quantities.set(
                id,
                (quantities.get(id) || 0) + quantity
            );
        }

        session = await mongoose.startSession();

        let createdOrder;

        await session.withTransaction(async () => {
            const orderItems = [];
            const vendorMap = new Map();

            let totalAmount = 0;

            for (const [productId, quantity] of quantities) {

                const product = await Product.findOneAndUpdate(
                    {
                        _id: productId,
                        stock: { $gte: quantity }
                    },
                    {
                        $inc: { stock: -quantity }
                    },
                    {
                        new: true,
                        session
                    }
                );

                if (!product) {
                    throw new Error(
                        `Insufficient stock or unavailable product: ${productId}`
                    );
                }

                const price = Number(product.price);

                if (!Number.isFinite(price) || price < 0) {
                    throw new Error('Invalid product price.');
                }

                if (!product.vendor || !product.store) {
                    throw new Error('Product vendor or store is missing.');
                }

                orderItems.push({
                    product: product._id,
                    vendor: product.vendor,
                    store: product.store,
                    productName: product.productName,
                    price,
                    quantity
                });

                const subtotal = price * quantity;
                totalAmount += subtotal;

                // GROUP PRODUCTS BY VENDOR AND STORE
                const key = `${product.vendor}_${product.store}`;

                if (!vendorMap.has(key)) {
                    vendorMap.set(key, {
                        vendor: product.vendor,
                        store: product.store,
                        subtotal: 0
                    });
                }

                vendorMap.get(key).subtotal += subtotal;
            }

            // CALCULATE VENDOR-WISE PAYOUTS
            const vendorPayouts = [];
            let totalCommission = 0;

            for (const vendorData of vendorMap.values()) {
                const subtotal = Number(
                    vendorData.subtotal.toFixed(2)
                );

                const vendorCommission = Number(
                    (subtotal * 0.05).toFixed(2)
                );

                const payoutAmount = Number(
                    (subtotal - vendorCommission).toFixed(2)
                );

                totalCommission += vendorCommission;

                vendorPayouts.push({
                    vendor: vendorData.vendor,
                    store: vendorData.store,
                    subtotal,
                    commission: vendorCommission,
                    payoutAmount,
                    payoutStatus: 'pending'
                });
            }

            const orders = await Order.create(
                [{
                    buyer: buyerId,
                    items: orderItems,
                    shippingAddress,
                    totalAmount: Number(totalAmount.toFixed(2)),
                    commission: Number(totalCommission.toFixed(2)),
                    vendorPayouts,
                    paymentStatus: 'pending',
                    orderStatus: 'placed'
                }],
                { session }
            );

            createdOrder = orders[0];
        });

        return res.status(201).json({
            message: 'Order placed successfully!',
            order: createdOrder
        });

    } catch (error) {
        console.error('Create Order Error:', error);

        if (error.message.startsWith('Insufficient stock')) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: 'Unable to place your order.',
            error: error.message
        });

    } finally {
        if (session) {
            await session.endSession();
        }
    }
};


// ========================================
// SIMULATED PAYMENT
// DEVELOPMENT DEMO ONLY
// ========================================

const simulatePayment = async (req, res) => {
    try {
        const buyerId = req.user?.id;
        const { orderId } = req.params;

        if (!buyerId) {
            return res.status(401).json({
                message: 'Buyer authentication required.'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                message: 'Invalid order ID.'
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            buyer: buyerId
        });

        if (!order) {
            return res.status(404).json({
                message: 'Order not found.'
            });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({
                message: 'This order has already been paid.'
            });
        }

        if (order.paymentStatus !== 'pending') {
            return res.status(400).json({
                message: 'This order cannot be paid.'
            });
        }

        // DEMO ONLY: No actual money is transferred.
        order.paymentStatus = 'paid';

        // Record vendor payout calculations.
        order.vendorPayouts.forEach((payout) => {
            payout.payoutStatus = 'recorded';
        });

        await order.save();

        return res.status(200).json({
            message: 'Demo payment successful!',
            paymentStatus: order.paymentStatus,
            vendorPayouts: order.vendorPayouts,
            order
        });

    } catch (error) {
        console.error('Simulated Payment Error:', error);

        return res.status(500).json({
            message: 'Unable to process demo payment.'
        });
    }
};


// ========================================
// GET MY ORDERS
// ========================================

const getMyOrders = async (req, res) => {
    try {
        const buyerId = req.user?.id;

        if (!buyerId) {
            return res.status(401).json({
                message: 'Buyer authentication required.'
            });
        }

        const orders = await Order.find({
            buyer: buyerId
        })
            .populate('items.product')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Orders fetched successfully!',
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error('Get My Orders Error:', error);

        return res.status(500).json({
            message: 'Unable to fetch orders.',
            error: error.message
        });
    }
};


// ========================================
// EXPORT
// ========================================

module.exports = {
    createOrder,
    simulatePayment,
    getMyOrders
};