// routes/posts.routes.js — Post CRUD and like endpoints
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getPosts, createPost, likePost, getUserPosts } = require('../controllers/postsController');
const { requireAuth } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        // Use timestamp + original name to avoid filename collisions
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// GET /api/posts — Get all approved posts
router.get('/', getPosts);

// GET /api/posts/user — Get posts of logged-in user
router.get('/user', requireAuth, getUserPosts);

// POST /api/posts — Create a new post (auth required)
router.post('/', requireAuth, upload.single('image'), createPost);

// POST /api/posts/:id/like — Like/unlike a post (auth required)
router.post('/:id/like', requireAuth, likePost);

module.exports = router;
