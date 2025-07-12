
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const questionController = require('../controllers/questionController');

// @route   POST /api/questions
// @desc    Ask a question (auth required)
router.post('/', auth, questionController.create);

// @route   GET /api/questions
// @desc    Get questions list (public)
router.get('/', questionController.list);

// @route   GET /api/questions/:id
// @desc    Get single question and its answers (public)
router.get('/:id', questionController.getOne);

// @route   PATCH /api/questions/:questionId/accept/:answerId
// @desc    Accept an answer (auth required, only question author)
router.patch('/:questionId/accept/:answerId', auth, questionController.acceptAnswer);

module.exports = router;
