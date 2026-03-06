// controllers/authController.js — handles login and registration logic
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'postpal_secret_key';
const SALT_ROUNDS = 10;

// POST /api/register — Create a new user account
async function register(req, res) {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if email already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Check if username already exists
        const [existingUsername] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsername.length > 0) {
            return res.status(409).json({ message: 'Username already taken.' });
        }

        // Hash the password before saving
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert the new user into the database
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        );

        res.status(201).json({ message: 'Account created successfully!', userId: result.insertId });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error during registration.' });
    }
}

// POST /api/login — Authenticate a user and return a JWT token
async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Look up user by email
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = rows[0];

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Create a JWT token with user info
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Login error:', err.message);
        // Return the DB error in development so it's easy to diagnose
        res.status(500).json({
            message: 'Server error during login.',
            detail: err.message, // e.g. "Unknown database 'postpal_db'" or "Table doesn't exist"
        });
    }
}

module.exports = { register, login };
