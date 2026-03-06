// controllers/commentsController.js — handles comment creation, listing, and deletion
const db = require('../db');

// GET /api/posts/:id/comments — Get all comments for a specific post
async function getComments(req, res) {
    const postId = req.params.id;

    try {
        const [comments] = await db.query(
            `SELECT c.id, c.content, c.created_at, u.username, u.role, u.profile_picture
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
            [postId]
        );
        res.json(comments);
    } catch (err) {
        console.error('Get comments error:', err);
        res.status(500).json({ message: 'Failed to load comments.' });
    }
}

// POST /api/posts/:id/comments — Add a comment to a post
async function addComment(req, res) {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
            [postId, userId, content.trim()]
        );

        // Fetch the newly created comment with user info to return it
        const [newComment] = await db.query(
            `SELECT c.id, c.content, c.created_at, u.username, u.role, u.profile_picture
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
            [result.insertId]
        );

        res.status(201).json(newComment[0]);
    } catch (err) {
        console.error('Add comment error:', err);
        res.status(500).json({ message: 'Failed to add comment.' });
    }
}

// DELETE /api/comments/:id — Delete a comment (admin only)
async function deleteComment(req, res) {
    const commentId = req.params.id;

    try {
        const [result] = await db.query('DELETE FROM comments WHERE id = ?', [commentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        res.json({ message: 'Comment deleted.' });
    } catch (err) {
        console.error('Delete comment error:', err);
        res.status(500).json({ message: 'Failed to delete comment.' });
    }
}

module.exports = { getComments, addComment, deleteComment };
