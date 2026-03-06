// middleware/auth.js — JWT authentication middleware
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'postpal_secret_key';

// Middleware to verify that a valid JWT token is present
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided. Please login.' });
    }

    // Token format: "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Invalid token format.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token expired or invalid. Please login again.' });
    }
}

// Middleware to ensure only admins can access a route
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
}

module.exports = { requireAuth, requireAdmin };
