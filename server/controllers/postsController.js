// controllers/postsController.js — handles post CRUD operations
const db = require('../db');

// GET /api/posts — Fetch all approved posts for the wall
async function getPosts(req, res) {
    try {
        const [posts] = await db.query(`
      SELECT 
        p.id, p.topic, p.content, p.image_path, p.status,
        p.likes_count, p.is_anonymous, p.author_type,
        p.created_at, p.approved_at,
        u.username, u.role, u.profile_picture,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'APPROVED'
      ORDER BY p.created_at DESC
    `);

        // If the post is anonymous, hide user info
        const sanitized = posts.map(post => ({
            ...post,
            username: post.is_anonymous ? 'Anonymous' : post.username,
            role: post.is_anonymous ? null : post.role,
            profile_picture: post.is_anonymous ? null : post.profile_picture,
        }));

        res.json(sanitized);
    } catch (err) {
        console.error('Get posts error:', err);
        res.status(500).json({ message: 'Failed to load posts.' });
    }
}

// POST /api/posts — Create a new post
async function createPost(req, res) {
    const { topic, content, is_anonymous } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!topic || !content) {
        return res.status(400).json({ message: 'Topic and content are required.' });
    }

    // Image path from multer (if uploaded)
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

    // Admin posts are approved automatically; user posts are PENDING
    const status = userRole === 'admin' ? 'APPROVED' : 'PENDING';
    const approvedAt = userRole === 'admin' ? new Date() : null;
    const authorType = userRole === 'admin' ? 'admin' : 'user';

    try {
        const [result] = await db.query(
            `INSERT INTO posts (user_id, author_type, is_anonymous, topic, content, image_path, status, approved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, authorType, is_anonymous ? 1 : 0, topic, content, imagePath, status, approvedAt]
        );

        res.status(201).json({
            message: status === 'APPROVED' ? 'Post published!' : 'Post submitted and awaiting approval.',
            postId: result.insertId,
            status,
        });
    } catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({ message: 'Failed to create post.' });
    }
}

// POST /api/posts/:id/like — Toggle like on a post
async function likePost(req, res) {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        // Check if user already liked this post
        const [existing] = await db.query(
            'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );

        if (existing.length > 0) {
            // Already liked — remove the like
            await db.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
            await db.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?', [postId]);
            return res.json({ message: 'Like removed.', liked: false });
        } else {
            // Not yet liked — add the like
            await db.query('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
            await db.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
            return res.json({ message: 'Post liked!', liked: true });
        }
    } catch (err) {
        console.error('Like post error:', err);
        res.status(500).json({ message: 'Failed to update like.' });
    }
}

// GET /api/posts/user — Get all posts by the currently logged-in user
async function getUserPosts(req, res) {
    const userId = req.user.id;
    try {
        const [posts] = await db.query(
            `SELECT id, topic, content, status, likes_count, created_at, image_path, is_anonymous
       FROM posts WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );
        res.json(posts);
    } catch (err) {
        console.error('Get user posts error:', err);
        res.status(500).json({ message: 'Failed to load your posts.' });
    }
}

module.exports = { getPosts, createPost, likePost, getUserPosts };
