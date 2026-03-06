// routes/admin.routes.js — Admin-only endpoints
const express = require('express');
const router = express.Router();
const { getPendingPosts, approvePost, rejectPost, deletePost, getStats } = require('../controllers/adminController');
const { getReports, dismissReport } = require('../controllers/reportsController');
const { deleteComment } = require('../controllers/commentsController');
const { getReportData } = require('../controllers/reportController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(requireAuth, requireAdmin);

// GET /api/admin/pending — Get all pending posts
router.get('/pending', getPendingPosts);

// GET /api/admin/stats — Dashboard stats
router.get('/stats', getStats);

// POST /api/admin/posts/:id/approve — Approve a post
router.post('/posts/:id/approve', approvePost);

// POST /api/admin/posts/:id/reject — Reject a post
router.post('/posts/:id/reject', rejectPost);

// DELETE /api/admin/posts/:id — Delete a post
router.delete('/posts/:id', deletePost);

// GET /api/admin/reports — View all reports
router.get('/reports', getReports);

// POST /api/admin/reports/:id/dismiss — Dismiss a report
router.post('/reports/:id/dismiss', dismissReport);

// DELETE /api/admin/comments/:id — Delete a comment (admin)
router.delete('/comments/:id', deleteComment);

// GET /api/admin/report/data — Get data for PDF report
router.get('/report/data', getReportData);

module.exports = router;
