// routes/users.routes.js — User management endpoints
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('../middleware/auth');
const { updateProfile } = require('../controllers/usersController');

// ─── Multer Storage Configuration (for profile pictures) ─────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Store images in the 'uploads/' folder
    },
    filename: (req, file, cb) => {
        // Unique filename based on timestamp
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const mimetypes = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetypes && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (JPEG, PNG, WEBP) are allowed.'));
    }
});

// PUT /api/users/profile — Update current user's profile
// Protected route requires authentication
router.put('/profile', requireAuth, upload.single('profile_picture'), updateProfile);

module.exports = router;
