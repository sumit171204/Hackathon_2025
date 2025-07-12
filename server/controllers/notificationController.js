const Notification = require('../models/Notification');
const crypto = require('crypto');

// Generate a notification access token for a user
const generateNotificationToken = (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  // In a real app, you'd store this token in the database with an expiration
  return token;
};

// GET /api/notifications - Get logged-in user's notifications
exports.list = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50 notifications
    
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });
    
    res.json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/notifications/public/:token - Get notifications via access token (no auth required)
exports.getPublicNotifications = async (req, res) => {
  try {
    const { token } = req.params;
    
    // In a real app, you'd validate the token against the database
    // For now, we'll use a simple approach - extract userId from token
    // This is not secure for production, but demonstrates the concept
    
    // For demo purposes, let's assume the token contains the userId
    // In production, you'd have a proper token validation system
    const userId = token; // This is simplified - in real app, decode token
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });
    
    res.json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/notifications/mark-read/:id - Mark a notification as read
exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Marked as read', notification });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/notifications/count - Get unread notification count
exports.getCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });
    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
