// server.js — Main entry point for PostPal backend
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
// Allow cross-origin requests from React dev server
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Parse JSON request bodies
app.use(express.json());

// Serve uploaded images as static files
// Access via: http://localhost:5000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const postsRoutes = require('./routes/posts.routes');
const commentsRoutes = require('./routes/comments.routes');
const reportsRoutes = require('./routes/reports.routes');
const adminRoutes = require('./routes/admin.routes');
const usersRoutes = require('./routes/users.routes');

app.use('/api', authRoutes);              // /api/login, /api/register
app.use('/api/posts', postsRoutes);       // /api/posts, /api/posts/:id/like
app.use('/api/posts', commentsRoutes);    // /api/posts/:id/comments
app.use('/api/reports', reportsRoutes);   // /api/reports
app.use('/api/admin', adminRoutes);       // /api/admin/pending, etc.
app.use('/api/users', usersRoutes);       // /api/users/profile

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'PostPal server is running!' });
});

// ─── Start Server ─────────────────────────────────────────────
const db = require('./db');

app.listen(PORT, async () => {
    console.log(`✅ PostPal server running on http://localhost:${PORT}`);

    // Test the database connection on startup so errors are visible immediately
    try {
        await db.query('SELECT 1');
        console.log('✅ Database connected successfully!');
    } catch (err) {
        console.error('❌ Database connection FAILED:', err.message);
        console.error('   → Make sure MySQL is running and you imported database/schema.sql');
        console.error('   → Check your .env file: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    }
});
