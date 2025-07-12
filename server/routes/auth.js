
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';



const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', authController.login);

// @route   POST /api/auth/logout
// @desc    Logout user (client should just delete token)
router.post('/logout', authController.logout);



// @route   GET /api/auth/me
// @desc    Get current authenticated user
router.get('/me', auth, authController.me);

// Update user profile
router.put('/users/profile', auth, userController.updateProfile);
// Get user profile by username
router.get('/users/:username', userController.getProfile);

module.exports = router;
