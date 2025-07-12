const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');

// Helper function to update user reputation
const updateReputation = async (userId, points) => {
  await User.findByIdAndUpdate(userId, { $inc: { reputation: points } });
};

// POST /api/questions - Create a new question
exports.create = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const question = await Question.create({
      title,
      description,
      tags,
      author: req.user.id,
      answers: [],
    });
    await question.populate('author', '_id username');
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/questions - List questions with filters, search, pagination
exports.list = async (req, res) => {
  try {
    const { filter, search, tags, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    let sort = { createdAt: -1 }; // Default sort by newest
    let useAggregation = false;
    let aggregationSort = {};

    // Apply filters
    if (filter === 'unanswered') {
      query.answers = { $size: 0 };
    } else if (filter === 'popular' || filter === 'trending' || filter === 'most-answered') {
      // Use aggregation for these filters
      useAggregation = true;
      aggregationSort = { answerCount: -1, createdAt: -1 };
    }

    if (useAggregation) {
      // AGGREGATION PIPELINE for sorting by answer count
      const pipeline = [
        { $match: query },
        { $addFields: { answerCount: { $size: "$answers" } } },
        { $sort: aggregationSort },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) }
      ];
      const questions = await Question.aggregate(pipeline);

      // Populate author field manually (since aggregate doesn't auto-populate)
      const populatedQuestions = await User.populate(questions, { path: "author", select: "_id username" });

      // Get total count for pagination
      const total = await Question.countDocuments(query);

      // Format result to match your frontend expectations
      const result = populatedQuestions.map(q => ({
        _id: q._id,
        title: q.title,
        content: q.description,
        tags: q.tags,
        answerCount: q.answerCount,
        isAnswered: q.answerCount > 0,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        author: q.author,
      }));

      return res.json({
        questions: result,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } else {
      // ORIGINAL LOGIC for other filters
      const questions = await Question.find(query)
        .populate('author', '_id username')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit));

      let result = await Promise.all(questions.map(async (q) => {
        return {
          _id: q._id,
          title: q.title,
          content: q.description,
          tags: q.tags,
          answerCount: q.answers.length,
          isAnswered: q.answers.length > 0,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
          author: q.author,
        };
      }));

      const total = await Question.countDocuments(query);

      return res.json({
        questions: result,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/questions/:id - Get single question and its answers
exports.getOne = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', '_id username')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: '_id username' }
      });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    
    // Format answers to include votes and user vote status
    const answers = await Answer.find({ _id: { $in: question.answers } })
      .populate('author', '_id username');
    
    const formattedAnswers = answers.map(a => {
      const votes = (a.upvotes ? a.upvotes.length : 0) - (a.downvotes ? a.downvotes.length : 0);
      
      // Check if current user has voted on this answer
      let userVote = null;
      if (req.user) {
        const userId = req.user.id;
        if (a.upvotes && a.upvotes.some(id => String(id) === userId)) {
          userVote = 'up';
        } else if (a.downvotes && a.downvotes.some(id => String(id) === userId)) {
          userVote = 'down';
        }
      }
      
      return {
        _id: a._id,
        content: a.content,
        votes: votes,
        userVote: userVote,
        isAccepted: String(question.acceptedAnswer) === String(a._id),
        author: a.author,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      };
    });
    
    res.json({
      _id: question._id,
      title: question.title,
      content: question.description,
      tags: question.tags,
      answers: formattedAnswers,
      acceptedAnswer: question.acceptedAnswer,
      author: question.author,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/questions/:questionId/accept/:answerId - Accept answer
exports.acceptAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    if (String(question.author) !== req.user.id) {
      return res.status(403).json({ message: 'Only the question author can accept an answer' });
    }
    question.acceptedAnswer = answerId;
    await question.save();
    res.json({ message: 'Answer accepted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
