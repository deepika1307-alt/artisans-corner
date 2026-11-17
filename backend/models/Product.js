const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    category: {
        type: String,
        required: true,
        trim: true
    },

    images: {
        type: [String],
        default: []
    },

    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },

    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },

    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;