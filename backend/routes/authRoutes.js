// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'chicken_pickle_secret_key_2026';
const OWNER_SECRET = process.env.ADMIN_REGISTRATION_SECRET || 'PICKLE_OWNER_2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, adminSecret, securityQuestion, securityAnswer } = req.body;

    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: 'All fields including security question are required' });
    }

    const userRole = role === 'admin' ? 'admin' : 'customer';
    if (userRole === 'admin' && adminSecret !== OWNER_SECRET) {
      return res.status(403).json({ message: 'Invalid Owner Secret Code' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: userRole,
      isAdmin: userRole === 'admin',
      securityQuestion,
      securityAnswer: hashedAnswer,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    res.status(500).json({ message: error.message || 'Failed to create account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isAdmin = Boolean(user.isAdmin || user.role === 'admin');
    const token = jwt.sign(
      { id: user._id, role: user.role, isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
});

// POST /api/auth/forgot-password/question
router.post('/forgot-password/question', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user || !user.securityAnswer) {
      return res.status(404).json({ message: 'Account or security question not found' });
    }
    res.json({ email: user.email, securityQuestion: user.securityQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify email' });
  }
});

// POST /api/auth/forgot-password/reset
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;
    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.securityAnswer) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const isValid = await bcrypt.compare(securityAnswer.trim().toLowerCase(), user.securityAnswer);
    if (!isValid) {
      return res.status(401).json({ message: 'Incorrect security answer' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successful! Please sign in.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -securityAnswer');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;