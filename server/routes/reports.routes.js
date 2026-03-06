// routes/reports.routes.js — Reporting endpoints
const express = require('express');
const router = express.Router();
const { createReport } = require('../controllers/reportsController');
const { requireAuth } = require('../middleware/auth');

// POST /api/reports — Submit a report (auth required)
router.post('/', requireAuth, createReport);

module.exports = router;
