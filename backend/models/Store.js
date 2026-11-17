const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({

    storeName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    logo: {
        type: String,
        default: ''
    },

    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    }

}, { timestamps: true });

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;