const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ error: 'Not authorized. Please log in.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id); // default scope excludes password
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ error: 'User not found or deactivated.' });
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalid or expired. Please log in again.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  next();
};

module.exports = { protect, requireRole };
