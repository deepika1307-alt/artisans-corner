const Order = require('../models/Order');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');

// ========================================
// GET VENDOR ANALYTICS
// ========================================

const getVendorAnalytics = async (req, res) => {
    try {
        const vendorId = req.user?.id;

        if (!vendorId) {
            return res.status(401).json({
                message: 'Vendor authentication required.'
            });
        }

        const orders = await Order.find({
            paymentStatus: 'paid',
            'vendorPayouts.vendor': vendorId
        }).sort({ createdAt: -1 });

        let totalSales = 0;
        let totalCommission = 0;
        let totalEarnings = 0;

        const salesHistory = [];

        orders.forEach((order) => {
            const vendorPayout = order.vendorPayouts.find(
                payout =>
                    payout.vendor.toString() === vendorId.toString()
            );

            if (!vendorPayout) return;

            totalSales += vendorPayout.subtotal;
            totalCommission += vendorPayout.commission;
            totalEarnings += vendorPayout.payoutAmount;

            salesHistory.push({
                orderId: order._id,
                date: order.createdAt,
                subtotal: vendorPayout.subtotal,
                commission: vendorPayout.commission,
                earnings: vendorPayout.payoutAmount,
                payoutStatus: vendorPayout.payoutStatus,
                orderStatus: order.orderStatus
            });
        });

        return res.status(200).json({
            message: 'Vendor analytics fetched successfully!',
            analytics: {
                totalOrders: orders.length,
                totalSales: Number(totalSales.toFixed(2)),
                totalCommission: Number(totalCommission.toFixed(2)),
                totalEarnings: Number(totalEarnings.toFixed(2)),
                salesHistory
            }
        });

    } catch (error) {
        console.error('Vendor Analytics Error:', error);

        return res.status(500).json({
            message: 'Unable to fetch vendor analytics.'
        });
    }
};


// ========================================
// GET ADMIN ANALYTICS
// ========================================

const getAdminAnalytics = async (req, res) => {
    try {
        const [
            totalUsers,
            totalVendors,
            totalStores,
            totalProducts,
            totalOrders,
            paidOrders,
            pendingOrders,
            failedOrders,
            stockResult,
            salesResult
        ] = await Promise.all([

            User.countDocuments(),

            User.countDocuments({
                roles: 'seller'
            }),

            Store.countDocuments(),

            Product.countDocuments(),

            Order.countDocuments(),

            Order.countDocuments({
                paymentStatus: 'paid'
            }),

            Order.countDocuments({
                paymentStatus: 'pending'
            }),

            Order.countDocuments({
                paymentStatus: 'failed'
            }),

            Product.aggregate([
                {
                    $group: {
                        _id: null,
                        totalStock: { $sum: '$stock' }
                    }
                }
            ]),

            Order.aggregate([
                {
                    $match: {
                        paymentStatus: 'paid'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: '$totalAmount' },
                        totalCommission: { $sum: '$commission' }
                    }
                }
            ])
        ]);

        const sales = salesResult[0] || {};
        const stock = stockResult[0] || {};

        return res.status(200).json({
            message: 'Admin analytics fetched successfully!',

            analytics: {
                totalUsers,
                totalVendors,
                totalStores,
                totalProducts,
                totalStock: stock.totalStock || 0,
                totalOrders,
                paidOrders,
                pendingOrders,
                failedOrders,
                totalSales: Number(
                    (sales.totalSales || 0).toFixed(2)
                ),
                totalCommission: Number(
                    (sales.totalCommission || 0).toFixed(2)
                )
            }
        });

    } catch (error) {
        console.error('Admin Analytics Error:', error);

        return res.status(500).json({
            message: 'Unable to fetch admin analytics.'
        });
    }
};


// ========================================
// EXPORT
// ========================================

module.exports = {
    getVendorAnalytics,
    getAdminAnalytics
};