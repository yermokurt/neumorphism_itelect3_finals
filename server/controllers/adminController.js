// controllers/adminController.js — admin moderation actions
const db = require('../db');

// GET /api/admin/pending — Get all posts awaiting moderation
async function getPendingPosts(req, res) {
    try {
        const [posts] = await db.query(`
      SELECT p.id, p.topic, p.content, p.image_path, p.is_anonymous,
             p.created_at, u.username, u.email
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'PENDING'
      ORDER BY p.created_at ASC
    `);
        res.json(posts);
    } catch (err) {
        console.error('Get pending posts error:', err);
        res.status(500).json({ message: 'Failed to load pending posts.' });
    }
}

// POST /api/admin/posts/:id/approve — Approve a pending post
async function approvePost(req, res) {
    const postId = req.params.id;
    try {
        await db.query(
            "UPDATE posts SET status = 'APPROVED', approved_at = NOW() WHERE id = ?",
            [postId]
        );
        res.json({ message: 'Post approved successfully.' });
    } catch (err) {
        console.error('Approve post error:', err);
        res.status(500).json({ message: 'Failed to approve post.' });
    }
}

// POST /api/admin/posts/:id/reject — Reject a pending post
async function rejectPost(req, res) {
    const postId = req.params.id;
    const { reason } = req.body;

    try {
        await db.query(
            "UPDATE posts SET status = 'REJECTED', rejection_reason = ? WHERE id = ?",
            [reason || 'Did not meet community guidelines.', postId]
        );
        res.json({ message: 'Post rejected.' });
    } catch (err) {
        console.error('Reject post error:', err);
        res.status(500).json({ message: 'Failed to reject post.' });
    }
}

// DELETE /api/admin/posts/:id — Delete a post entirely
async function deletePost(req, res) {
    const postId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM posts WHERE id = ?', [postId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.json({ message: 'Post deleted.' });
    } catch (err) {
        console.error('Delete post error:', err);
        res.status(500).json({ message: 'Failed to delete post.' });
    }
}

// GET /api/admin/stats — Dashboard statistics
async function getStats(req, res) {
    try {
        const [[{ total_users }]] = await db.query('SELECT COUNT(*) AS total_users FROM users');
        const [[{ total_posts }]] = await db.query('SELECT COUNT(*) AS total_posts FROM posts');
        const [[{ pending_posts }]] = await db.query("SELECT COUNT(*) AS pending_posts FROM posts WHERE status = 'PENDING'");
        const [[{ total_reports }]] = await db.query("SELECT COUNT(*) AS total_reports FROM reports WHERE status = 'PENDING'");

        res.json({ total_users, total_posts, pending_posts, total_reports });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ message: 'Failed to load stats.' });
    }
}

module.exports = { getPendingPosts, approvePost, rejectPost, deletePost, getStats };
