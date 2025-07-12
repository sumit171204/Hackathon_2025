const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'user', 'admin'], default: 'user' },
  notifications: [notificationSchema],
  banned: { type: Boolean, default: false },
  // Profile fields
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  avatar: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
