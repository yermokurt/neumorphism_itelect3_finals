// controllers/reportController.js — PDF report data for admin
const db = require('../db');

// GET /api/admin/report/data — Fetch all users with their post and like stats
async function getReportData(req, res) {
  try {
    // Get all users with their total posts and total likes received
    const [users] = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT p.id) AS total_posts,
        COALESCE(SUM(p.likes_count), 0) AS total_likes,
        COUNT(DISTINCT CASE WHEN p.status = 'APPROVED' THEN p.id END) AS approved_posts,
        COUNT(DISTINCT CASE WHEN p.status = 'PENDING' THEN p.id END) AS pending_posts,
        COUNT(DISTINCT CASE WHEN p.status = 'REJECTED' THEN p.id END) AS rejected_posts
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      GROUP BY u.id
      ORDER BY total_posts DESC
    `);

    // Get top posts (approved, sorted by likes)
    const [topPosts] = await db.query(`
      SELECT 
        p.id, p.topic, p.content, p.likes_count, p.created_at,
        u.username, u.role
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'APPROVED'
      ORDER BY p.likes_count DESC
      LIMIT 20
    `);

    // Get overall platform stats
    const [[totals]] = await db.query(`
      SELECT 
        COUNT(DISTINCT u.id) AS total_users,
        COUNT(DISTINCT p.id) AS total_posts,
        COALESCE(SUM(p.likes_count), 0) AS total_likes,
        COUNT(DISTINCT c.id) AS total_comments,
        COUNT(DISTINCT r.id) AS total_reports
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN reports r ON p.id = r.post_id
    `);

    // Get trending topics
    const [trendingTopics] = await db.query(`
      SELECT 
        p.topic,
        COUNT(DISTINCT p.id) AS total_posts,
        COALESCE(SUM(p.likes_count), 0) AS total_likes,
        COUNT(DISTINCT c.id) AS total_comments
      FROM posts p
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.status = 'APPROVED'
      GROUP BY p.topic
      ORDER BY total_posts DESC, total_likes DESC
    `);

    res.json({ users, topPosts, trendingTopics, totals, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Report data error:', err.message);
    res.status(500).json({ message: 'Failed to generate report data.', detail: err.message });
  }
}

module.exports = { getReportData };
