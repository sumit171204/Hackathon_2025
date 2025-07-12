const Answer = require('../models/Answer');
const Question = require('../models/Question');

// POST /api/answers/:questionId - Post a new answer
exports.create = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });
    const question = await Question.findById(questionId).populate('author', '_id username').lean();
    if (!question) return res.status(404).json({ message: 'Question not found' });
    const answer = await Answer.create({
      questionId,
      content,
      author: req.user.id,
      upvotes: [],
      downvotes: [],
    });
    await Question.updateOne({ _id: questionId }, { $push: { answers: answer._id } });
    await answer.populate('author', '_id username');


    const Notification = require('../models/Notification');
    // Get question author ID - now properly populated
    const questionAuthorId = question.author._id;
    console.log('Question author ID:', questionAuthorId);
    console.log('Current user ID:', req.user.id);
    console.log('Are they different?', String(questionAuthorId) !== String(req.user.id));
    
    if (String(questionAuthorId) !== String(req.user.id)) {
      const notification = await Notification.create({
        userId: questionAuthorId,
        type: 'answer',
        message: `${answer.author.username} answered your question: "${question.title}"`,
        isRead: false,
      });
      console.log('Notification created for question author:', notification);
      if (global.io) {
        global.io.to(String(questionAuthorId)).emit('notification', notification);
        console.log('Socket notification sent to user:', questionAuthorId);
      } else {
        console.log('Socket.io not available');
      }
    } else {
      console.log('Skipping notification - user answering their own question');
    }

    // Notify mentioned users in answer content (e.g. @username)
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentionedUsernames = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      if (!mentionedUsernames.includes(match[1])) mentionedUsernames.push(match[1]);
    }
    if (mentionedUsernames.length > 0) {
      const User = require('../models/User');
      const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } });
      for (const user of mentionedUsers) {
        if (String(user._id) !== String(req.user.id)) { // Don't notify self
          const notification = await Notification.create({
            userId: user._id,
            type: 'mention',
            message: `${answer.author.username} mentioned you in an answer to: "${question.title}"`,
            isRead: false,
          });
          console.log('Notification for mention:', notification);
          if (global.io) {
            global.io.to(String(user._id)).emit('notification', notification);
          }
        }
      }
    }

    res.status(201).json({
      _id: answer._id,
      content: answer.content,
      questionId: answer.questionId,
      upvotes: answer.upvotes.map(String),
      downvotes: answer.downvotes.map(String),
      upvoteCount: answer.upvotes.length,
      downvoteCount: answer.downvotes.length,
      totalVotes: answer.upvotes.length - answer.downvotes.length,
      author: answer.author,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/answers/vote/:answerId - Upvote or downvote an answer
exports.vote = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { voteType } = req.body;
    const userId = req.user.id;
    const answer = await Answer.findById(answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    // Only allow one vote per user per answer
    answer.upvotes = answer.upvotes.filter(id => String(id) !== userId);
    answer.downvotes = answer.downvotes.filter(id => String(id) !== userId);
    if (voteType === 'up') {
      answer.upvotes.push(userId);
    } else if (voteType === 'down') {
      answer.downvotes.push(userId);
    } else {
      return res.status(400).json({ message: 'Invalid voteType' });
    }
    await answer.save();
    await answer.populate('author', '_id username');

    // Notification for answer author when someone votes (not self)
    const Notification = require('../models/Notification');
    const answerAuthorId = answer.author && answer.author._id ? answer.author._id : answer.author;
    if (String(answerAuthorId) !== String(userId)) {
      const notification = await Notification.create({
        userId: answerAuthorId,
        type: 'vote',
        message: `${req.user.username} ${voteType === 'up' ? 'upvoted' : 'downvoted'} your answer`,
        isRead: false,
      });
      console.log('Notification for vote:', notification);
      if (global.io) {
        global.io.to(String(answerAuthorId)).emit('notification', notification);
      }
    }

    res.json({
      _id: answer._id,
      content: answer.content,
      questionId: answer.questionId,
      upvotes: answer.upvotes.map(String),
      downvotes: answer.downvotes.map(String),
      upvoteCount: answer.upvotes.length,
      downvoteCount: answer.downvotes.length,
      totalVotes: answer.upvotes.length - answer.downvotes.length,
      author: answer.author,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
