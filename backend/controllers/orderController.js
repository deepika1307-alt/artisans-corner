const mongoose = require('mongoose');
const Stripe = require('stripe');
const crypto = require('crypto');

const Order = require('../models/Order');
const Product = require('../models/Product');

// ========================================
// STRIPE CONFIGURATION
// ========================================

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('Stripe secret key is not configured.');
    }

    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// ========================================
// HELPER: NORMALIZE CART ITEMS
// ========================================

const normalizeItems = (items) => {
    const quantities = new Map();

    for (const item of items) {
        const productId = item.productId?.toString();
        const quantity = Number(item.quantity);

        if (
            !productId ||
            !mongoose.Types.ObjectId.isValid(productId) ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            throw new Error('Invalid cart item.');
        }

        quantities.set(
            productId,
            (quantities.get(productId) || 0) + quantity
        );
    }

    return Array.from(quantities.entries())
        .map(([productId, quantity]) => ({
            productId,
            quantity
        }))
        .sort((a, b) =>
            a.productId.localeCompare(b.productId)
        );
};

// ========================================
// HELPER: VALIDATE SHIPPING ADDRESS
// ========================================

const validateShippingAddress = (shippingAddress) => {
    const requiredFields = [
        'fullName',
        'phone',
        'address',
        'city',
        'state',
        'pincode'
    ];

    for (const field of requiredFields) {
        if (
            !shippingAddress?.[field] ||
            !shippingAddress[field].toString().trim()
        ) {
            return `Please provide ${field}.`;
        }
    }

    return null;
};

// ========================================
// HELPER: BUILD ORDER DATA
// DEDUCT STOCK AND CALCULATE COMMISSION
// ========================================

const buildOrderData = async (normalizedItems, session) => {
    const orderItems = [];
    const vendorMap = new Map();

    let totalAmount = 0;

    for (const item of normalizedItems) {
        const product = await Product.findOneAndUpdate(
            {
                _id: item.productId,
                stock: {
                    $gte: item.quantity
                }
            },
            {
                $inc: {
                    stock: -item.quantity
                }
            },
            {
                new: true,
                session
            }
        );

        if (!product) {
            throw new Error(
                `Insufficient stock or unavailable product: ${item.productId}`
            );
        }

        const price = Number(product.price);

        if (!Number.isFinite(price) || price < 0) {
            throw new Error('Invalid product price.');
        }

        if (!product.vendor || !product.store) {
            throw new Error(
                'Product vendor or store is missing.'
            );
        }

        const subtotal = price * item.quantity;

        totalAmount += subtotal;

        orderItems.push({
            product: product._id,
            vendor: product.vendor,
            store: product.store,
            productName: product.productName,
            price,
            quantity: item.quantity
        });

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

    totalAmount = Number(totalAmount.toFixed(2));

    // Calculate vendor commission and payout
    const vendorPayouts = [];
    let totalCommission = 0;

    for (const vendorData of vendorMap.values()) {
        const subtotal = Number(
            vendorData.subtotal.toFixed(2)
        );

        const commission = Number(
            (subtotal * 0.05).toFixed(2)
        );

        const payoutAmount = Number(
            (subtotal - commission).toFixed(2)
        );

        totalCommission += commission;

        vendorPayouts.push({
            vendor: vendorData.vendor,
            store: vendorData.store,
            subtotal,
            commission,
            payoutAmount,
            payoutStatus: 'pending'
        });
    }

    return {
        orderItems,
        totalAmount,
        commission: Number(totalCommission.toFixed(2)),
        vendorPayouts
    };
};

// ========================================
// CREATE STRIPE ORDER
// ========================================

const createOrder = async (req, res) => {
    let session;
    let paymentVerified = false;
    let orderSaved = false;
    let paymentIntentId = null;

    try {
        const buyerId = req.user?.id;

        const {
            items,
            shippingAddress,
            paymentIntentId: submittedPaymentIntentId
        } = req.body;

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

        if (!submittedPaymentIntentId) {
            return res.status(400).json({
                message: 'Payment confirmation is required.'
            });
        }

        paymentIntentId = submittedPaymentIntentId;

        const addressError = validateShippingAddress(
            shippingAddress
        );

        if (addressError) {
            return res.status(400).json({
                message: addressError
            });
        }

        const normalizedItems = normalizeItems(items);

        // Create cart hash to verify the payment matches the cart
        const cartHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(normalizedItems))
            .digest('hex');

        // Verify payment directly with Stripe
        const stripe = getStripe();

        const paymentIntent =
            await stripe.paymentIntents.retrieve(paymentIntentId);

        if (
            paymentIntent.status !== 'succeeded' ||
            paymentIntent.metadata?.buyerId !== buyerId.toString() ||
            paymentIntent.metadata?.cartHash !== cartHash ||
            paymentIntent.currency !== 'inr'
        ) {
            return res.status(400).json({
                message: 'Payment could not be verified.'
            });
        }

        paymentVerified = true;

        // Prevent duplicate orders for the same payment
        const existingOrder = await Order.findOne({
            stripePaymentIntentId: paymentIntentId
        });

        if (existingOrder) {
            return res.status(409).json({
                message: 'An order already exists for this payment.'
            });
        }

        session = await mongoose.startSession();

        let createdOrder;

        await session.withTransaction(async () => {
            const orderData = await buildOrderData(
                normalizedItems,
                session
            );

            // Stripe amount is stored in paise
            const expectedAmount = Math.round(
                orderData.totalAmount * 100
            );

            if (paymentIntent.amount !== expectedAmount) {
                throw new Error(
                    'Cart total changed. Please restart checkout.'
                );
            }

            const orders = await Order.create(
                [{
                    buyer: buyerId,
                    items: orderData.orderItems,
                    shippingAddress,
                    totalAmount: orderData.totalAmount,
                    commission: orderData.commission,
                    vendorPayouts: orderData.vendorPayouts,
                    paymentStatus: 'paid',
                    orderStatus: 'placed',
                    stripePaymentIntentId: paymentIntentId
                }],
                {
                    session
                }
            );

            createdOrder = orders[0];
        });

        orderSaved = true;

        return res.status(201).json({
            message: 'Payment verified and order placed!',
            order: createdOrder
        });

    } catch (error) {
        console.error(
            'Create Stripe Order Error:',
            error.message
        );

        // Refund if payment succeeded but order creation failed
        if (
            paymentVerified &&
            !orderSaved &&
            paymentIntentId
        ) {
            try {
                const stripe = getStripe();

                await stripe.refunds.create({
                    payment_intent: paymentIntentId
                });

                console.log(
                    'Refund initiated for failed order creation.'
                );
            } catch (refundError) {
                console.error(
                    'Refund Error:',
                    refundError.message
                );
            }
        }

        if (
            error.message.startsWith('Insufficient stock') ||
            error.message === 'Invalid cart item.' ||
            error.message.includes('Cart total changed')
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: 'Unable to place your order.'
        });

    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

// ========================================
// CREATE DEMO ORDER
// NO REAL PAYMENT IS COLLECTED
// ========================================

const createDemoOrder = async (req, res) => {
    let session;

    try {
        if (process.env.DEMO_PAYMENTS_ENABLED !== 'true') {
            return res.status(403).json({
                message: 'Demo checkout is currently disabled.'
            });
        }

        const buyerId = req.user?.id;

        const {
            items,
            shippingAddress
        } = req.body;

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

        const addressError = validateShippingAddress(
            shippingAddress
        );

        if (addressError) {
            return res.status(400).json({
                message: addressError
            });
        }

        const normalizedItems = normalizeItems(items);

        session = await mongoose.startSession();

        let createdOrder;

        await session.withTransaction(async () => {
            const orderData = await buildOrderData(
                normalizedItems,
                session
            );

            const orders = await Order.create(
                [{
                    buyer: buyerId,
                    items: orderData.orderItems,
                    shippingAddress,
                    totalAmount: orderData.totalAmount,
                    commission: orderData.commission,
                    vendorPayouts: orderData.vendorPayouts,
                    paymentStatus: 'pending',
                    orderStatus: 'placed',
                    stripePaymentIntentId: null
                }],
                {
                    session
                }
            );

            createdOrder = orders[0];
        });

        return res.status(201).json({
            message: 'Demo order created. No payment has been collected.',
            order: createdOrder
        });

    } catch (error) {
        console.error(
            'Create Demo Order Error:',
            error.message
        );

        if (
            error.message.startsWith('Insufficient stock') ||
            error.message === 'Invalid cart item.'
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: 'Unable to create demo order.'
        });

    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

// ========================================
// SIMULATE DEMO PAYMENT
// NO REAL PAYMENT
// ========================================

const simulatePayment = async (req, res) => {
    try {
        if (process.env.DEMO_PAYMENTS_ENABLED !== 'true') {
            return res.status(403).json({
                message: 'Demo payments are currently disabled.'
            });
        }

        const buyerId = req.user?.id;
        const { orderId } = req.params;

        const order = await Order.findOne({
            _id: orderId,
            buyer: buyerId,
            paymentStatus: 'pending',
            stripePaymentIntentId: null
        });

        if (!order) {
            return res.status(404).json({
                message: 'Demo order not found or already processed.'
            });
        }

        // Mark the simulated payment as completed
        order.paymentStatus = 'paid';

        // Record the demo payout status.
        // No real money is transferred.
        order.vendorPayouts.forEach((payout) => {
            payout.payoutStatus = 'recorded';
        });

        await order.save();

        return res.status(200).json({
            message: 'Demo payment successful. No real payment was collected.',
            order
        });

    } catch (error) {
        console.error(
            'Demo Payment Error:',
            error.message
        );

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
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            message: 'Orders fetched successfully!',
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error(
            'Get My Orders Error:',
            error.message
        );

        return res.status(500).json({
            message: 'Unable to fetch orders.'
        });
    }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
    createOrder,
    createDemoOrder,
    simulatePayment,
    getMyOrders
};