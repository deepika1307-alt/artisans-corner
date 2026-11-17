const jwt = require('jsonwebtoken');

// AUTHENTICATION MIDDLEWARE
const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Not authorized. No token provided."
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token."
        });
    }
};


// ROLE-BASED AUTHORIZATION
const authorize = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.user || !req.user.roles) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        const hasPermission = allowedRoles.some(role =>
            req.user.roles.includes(role)
        );

        if (!hasPermission) {
            return res.status(403).json({
                message: "Access denied. Insufficient permissions."
            });
        }

        next();
    };
};


module.exports = {
    protect,
    authorize
};