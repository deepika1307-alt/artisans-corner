const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const productRoutes = require('./routes/productRoutes');
const imageRoutes = require('./routes/imageRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// CORS CONFIGURATION
const allowedOrigins = (
    process.env.FRONTEND_URL || 'http://localhost:5173'
).split(',').map(origin => origin.trim());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// MIDDLEWARE
app.use(express.json({ limit: '10mb' }));

// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use("/api/payments", paymentRoutes);

// HOME ROUTE
app.get('/', (req, res) => {
    res.send("Welcome to Artisan's Corner API!");
});

// SERVER PORT
const PORT = process.env.PORT || 5000;

// START SERVER
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
};

startServer();