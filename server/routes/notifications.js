
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// @route   GET /api/notifications
// @desc    Get notifications for user (auth required)
router.get('/', auth, notificationController.list);

// @route   GET /api/notifications/count
// @desc    Get unread notification count (auth required)
router.get('/count', auth, notificationController.getCount);

// @route   GET /api/notifications/public/:token
// @desc    Get notifications via access token (no auth required)
router.get('/public/:token', notificationController.getPublicNotifications);

// @route   PATCH /api/notifications/mark-read/:id
// @desc    Mark a notification as read (auth required)
router.patch('/mark-read/:id', auth, notificationController.markRead);

// @route   PATCH /api/notifications/mark-all-read
// @desc    Mark all notifications as read (auth required)
router.patch('/mark-all-read', auth, notificationController.markAllRead);

module.exports = router;
