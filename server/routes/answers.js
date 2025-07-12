
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const answerController = require('../controllers/answerController');

// @route   POST /api/answers/:questionId
// @desc    Post an answer (auth required)
router.post('/:questionId', auth, answerController.create);

// @route   POST /api/answers/vote/:answerId
// @desc    Vote on an answer (auth required)
router.post('/vote/:answerId', auth, answerController.vote);

module.exports = router;
