// routes/comments.routes.js — Comment endpoints
const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment } = require('../controllers/commentsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/posts/:id/comments — Get comments for a specific post
router.get('/:id/comments', getComments);

// POST /api/posts/:id/comments — Add a comment (auth required)
router.post('/:id/comments', requireAuth, addComment);

module.exports = router;
