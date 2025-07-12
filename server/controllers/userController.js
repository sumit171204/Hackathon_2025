const User = require('../models/User');

// PUT /users/profile - Update current user's profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, location, website, avatar } = req.body;
    const update = { bio, location, website, avatar };
    const user = await User.findByIdAndUpdate(userId, update, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /users/:username - Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 