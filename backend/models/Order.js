const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },

                vendor: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },

                store: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Store',
                    required: true
                },

                productName: {
                    type: String,
                    required: true
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                }
            }
        ],

        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true }
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        commission: {
            type: Number,
            default: 0
        },

        // Vendor-wise payout records
        vendorPayouts: [
            {
                vendor: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },

                store: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Store',
                    required: true
                },

                subtotal: {
                    type: Number,
                    required: true,
                    min: 0
                },

                commission: {
                    type: Number,
                    required: true,
                    min: 0
                },

                payoutAmount: {
                    type: Number,
                    required: true,
                    min: 0
                },

                payoutStatus: {
                    type: String,
                    enum: ['pending', 'recorded'],
                    default: 'pending'
                }
            }
        ],

        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },

        orderStatus: {
            type: String,
            enum: [
                'placed',
                'processing',
                'shipped',
                'delivered',
                'cancelled'
            ],
            default: 'placed'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Order', orderSchema);