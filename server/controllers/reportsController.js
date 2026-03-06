// controllers/reportsController.js — handles post reporting
const db = require('../db');

// POST /api/reports — Report a post
async function createReport(req, res) {
    const { post_id, reason, details } = req.body;
    const userId = req.user.id;

    if (!post_id || !reason) {
        return res.status(400).json({ message: 'Post ID and reason are required.' });
    }

    const validReasons = ['Spam', 'Harassment', 'Misinformation', 'Other'];
    if (!validReasons.includes(reason)) {
        return res.status(400).json({ message: 'Invalid reason selected.' });
    }

    try {
        // Check if user already reported this post
        const [existing] = await db.query(
            'SELECT id FROM reports WHERE post_id = ? AND user_id = ?',
            [post_id, userId]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'You have already reported this post.' });
        }

        await db.query(
            'INSERT INTO reports (post_id, user_id, reason, details) VALUES (?, ?, ?, ?)',
            [post_id, userId, reason, details || null]
        );

        res.status(201).json({ message: 'Report submitted successfully.' });
    } catch (err) {
        console.error('Create report error:', err);
        res.status(500).json({ message: 'Failed to submit report.' });
    }
}

// GET /api/admin/reports — Get all reports (admin only)
async function getReports(req, res) {
    try {
        const [reports] = await db.query(`
      SELECT 
        r.id, r.reason, r.details, r.status, r.created_at,
        p.id AS post_id, p.topic, p.content,
        u.username AS reporter_username
      FROM reports r
      JOIN posts p ON r.post_id = p.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
        res.json(reports);
    } catch (err) {
        console.error('Get reports error:', err);
        res.status(500).json({ message: 'Failed to load reports.' });
    }
}

// POST /api/admin/reports/:id/dismiss — Dismiss a report
async function dismissReport(req, res) {
    const reportId = req.params.id;
    try {
        await db.query("UPDATE reports SET status = 'DISMISSED' WHERE id = ?", [reportId]);
        res.json({ message: 'Report dismissed.' });
    } catch (err) {
        console.error('Dismiss report error:', err);
        res.status(500).json({ message: 'Failed to dismiss report.' });
    }
}

module.exports = { createReport, getReports, dismissReport };
