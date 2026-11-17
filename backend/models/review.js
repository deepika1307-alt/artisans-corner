const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },

        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 500
        },

        verifiedPurchase: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// One review per buyer per product
reviewSchema.index(
    { product: 1, buyer: 1 },
    { unique: true }
);

module.exports = mongoose.model('Review', reviewSchema);