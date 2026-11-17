const Product = require('../models/Product');
const Store = require('../models/Store');

// CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        const {
            productName,
            description,
            price,
            category,
            stock,
            images
        } = req.body;

        if (!productName || !description || price === undefined || !category) {
            return res.status(400).json({
                message: "Please provide all required product details."
            });
        }

        if (!Number.isFinite(Number(price)) || Number(price) < 0) {
            return res.status(400).json({
                message: "Please provide a valid product price."
            });
        }

        if (stock !== undefined &&
            (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
            return res.status(400).json({
                message: "Stock must be a non-negative whole number."
            });
        }

        const store = await Store.findOne({
            owner: req.user.id
        });

        if (!store) {
            return res.status(404).json({
                message: "Please create your store first."
            });
        }

        const productImages = Array.isArray(images)
            ? images
            : images
                ? [images]
                : [];

        const product = await Product.create({
            productName: productName.trim(),
            description: description.trim(),
            price: Number(price),
            category: category.trim(),
            stock: stock === undefined ? 0 : Number(stock),
            images: productImages,
            store: store._id,
            vendor: req.user.id
        });

        res.status(201).json({
            message: "Product created successfully!",
            product
        });

    } catch (error) {
        console.error("Product Creation Error:", error);

        res.status(500).json({
            message: "Unable to create product."
        });
    }
};

// GET MY PRODUCTS
const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({
            vendor: req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Products fetched successfully!",
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Get Products Error:", error);

        res.status(500).json({
            message: "Unable to fetch products."
        });
    }
};

// GET ALL PUBLIC PRODUCTS
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({
            stock: { $gt: 0 }
        })
            .populate('store', 'storeName logo')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Products fetched successfully!",
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Get All Products Error:", error);

        res.status(500).json({
            message: "Unable to fetch products."
        });
    }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            vendor: req.user.id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or access denied."
            });
        }

        const allowedFields = [
            'productName',
            'description',
            'price',
            'category',
            'stock',
            'images'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        if (!Number.isFinite(Number(product.price)) ||
            Number(product.price) < 0) {
            return res.status(400).json({
                message: "Please provide a valid product price."
            });
        }

        if (!Number.isInteger(Number(product.stock)) ||
            Number(product.stock) < 0) {
            return res.status(400).json({
                message: "Stock must be a non-negative whole number."
            });
        }

        await product.save();

        res.status(200).json({
            message: "Product updated successfully!",
            product
        });

    } catch (error) {
        console.error("Update Product Error:", error);

        res.status(500).json({
            message: "Unable to update product."
        });
    }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            vendor: req.user.id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or access denied."
            });
        }

        res.status(200).json({
            message: "Product deleted successfully!"
        });

    } catch (error) {
        console.error("Delete Product Error:", error);

        res.status(500).json({
            message: "Unable to delete product."
        });
    }
};

module.exports = {
    createProduct,
    getMyProducts,
    getAllProducts,
    updateProduct,
    deleteProduct
};