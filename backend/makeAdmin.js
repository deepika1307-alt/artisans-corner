const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user');

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({
            email: 'buyer.test@gmail.com'
        });

        if (!user) {
            console.log('User not found!');
            return;
        }

        user.roles = ['buyer', 'admin'];
        user.password = await bcrypt.hash('Lulu13', 10);

        await user.save();

        console.log('Admin account updated successfully!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
};

updateAdmin();