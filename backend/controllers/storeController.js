const Store = require('../models/Store');
const User = require('../models/User');

// VENDOR ONBOARDING
const createStore = async (req, res) => {
    try {
        const { storeName, description, logo } = req.body;

        // Validate required fields
        if (!storeName || !description) {
            return res.status(400).json({
                message: "Store name and description are required."
            });
        }

        if (storeName.trim().length < 3) {
            return res.status(400).json({
                message: "Store name must contain at least 3 characters."
            });
        }

        if (description.trim().length > 500) {
            return res.status(400).json({
                message: "Description cannot exceed 500 characters."
            });
        }

        // Find authenticated user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        // Check existing store
        const existingStore = await Store.findOne({
            owner: user._id
        });

        if (existingStore) {
            return res.status(409).json({
                message: "You already have a store."
            });
        }

        // Create store
        const store = await Store.create({
            storeName: storeName.trim(),
            description: description.trim(),
            logo: logo || '',
            owner: user._id
        });

        try {
            // Assign seller role without removing buyer role
            await User.findByIdAndUpdate(
                user._id,
                {
                    $addToSet: { roles: 'seller' }
                },
                { runValidators: true }
            );
        } catch (error) {
            // Roll back store creation if role update fails
            await Store.findByIdAndDelete(store._id);
            throw error;
        }

        res.status(201).json({
            message: "Congratulations! Your store has been created successfully.",
            store: {
                id: store._id,
                storeName: store.storeName,
                description: store.description,
                logo: store.logo,
                owner: store.owner
            },
            roles: [...new Set([...user.roles, 'seller'])]
        });

    } catch (error) {
        console.error("Store Creation Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Store name or owner already exists."
            });
        }

        res.status(500).json({
            message: "Unable to create store. Please try again."
        });
    }
};

module.exports = { createStore };