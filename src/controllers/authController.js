const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const logger = require('../utils/logger');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @route  POST /api/auth/signup
const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, age, gender, language } = req.body;

  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ error: 'An account with this email already exists.' });

  const user = await User.create({ name, email, password, age, gender, language });

  logger.info(`New user registered: ${email}`);
  res.status(201).json({
    token: generateToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      streak: user.streak,
    },
  });
};

// @route  POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  // Must use scope to include password field
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  user.updateStreak();
  await user.save();

  res.json({
    token: generateToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      streak: user.streak,
      totalCheckIns: user.totalCheckIns,
      aiMemory: user.aiMemory,
    },
  });
};

// @route  GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json({ user });
};

// @route  PUT /api/auth/preferences
const updatePreferences = async (req, res) => {
  const { language, preferences, age, gender } = req.body;
  const user = await User.findByPk(req.user.id);

  if (language) user.language = language;
  if (age) user.age = age;
  if (gender) user.gender = gender;
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();
  res.json({ user });
};

module.exports = { signup, login, getMe, updatePreferences };
