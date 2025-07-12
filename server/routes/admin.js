const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// Admin middleware - check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Get platform statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const bannedUsers = await User.countDocuments({ banned: true });
    const pendingQuestions = await Question.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalQuestions,
      totalAnswers,
      bannedUsers,
      pendingQuestions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, 'username email role banned createdAt')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Ban/Unban user
router.patch('/users/:userId/ban', adminAuth, async (req, res) => {
  try {
    const { banned } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { banned },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${banned ? 'banned' : 'unbanned'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get questions for moderation
router.get('/questions', adminAuth, async (req, res) => {
  try {
    const questions = await Question.find({})
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Moderate question
router.patch('/questions/:questionId/moderate', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.questionId,
      { status },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question moderated successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete question (admin only)
router.delete('/questions/:questionId', adminAuth, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Also delete associated answers
    await Answer.deleteMany({ question: req.params.questionId });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete answer (admin only)
router.delete('/answers/:answerId', adminAuth, async (req, res) => {
  try {
    const answer = await Answer.findByIdAndDelete(req.params.answerId);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send platform-wide message
router.post('/messages', adminAuth, async (req, res) => {
  try {
    const { message, title } = req.body;
    
    if (!message || !title) {
      return res.status(400).json({ message: 'Message and title are required' });
    }

    // In a real app, you'd send this to all connected users via Socket.io
    // For now, we'll just return success
    if (global.io) {
      global.io.emit('platform-message', { title, message });
    }

    res.json({ message: 'Platform message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user activity report
router.get('/reports/user-activity', adminAuth, async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: 'author',
          as: 'questions'
        }
      },
      {
        $lookup: {
          from: 'answers',
          localField: '_id',
          foreignField: 'author',
          as: 'answers'
        }
      },
      {
        $project: {
          username: 1,
          email: 1,
          role: 1,
          banned: 1,
          createdAt: 1,
          questionCount: { $size: '$questions' },
          answerCount: { $size: '$answers' },
          lastActivity: { $max: ['$createdAt', { $max: '$questions.createdAt' }, { $max: '$answers.createdAt' }] }
        }
      },
      { $sort: { lastActivity: -1 } }
    ]);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 