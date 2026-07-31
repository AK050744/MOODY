const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: { notEmpty: true, len: [1, 60] },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: { type: DataTypes.INTEGER, validate: { min: 13, max: 25 } },
  gender: { type: DataTypes.ENUM('male', 'female', 'non-binary', 'prefer_not_to_say') },
  language: { type: DataTypes.ENUM('en', 'hi', 'mr'), defaultValue: 'en' },

  // Stored as JSON columns
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      contentTypes: ['movies', 'music', 'podcasts', 'games', 'audiobooks'],
      genres: [],
      dislikedContent: [],
    },
  },
  aiMemory: {
    type: DataTypes.JSON,
    defaultValue: {
      summary: '',
      dominantEmotions: [],
      triggers: [],
      helpers: [],
      lastUpdated: null,
    },
  },

  streak: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastActiveDate: { type: DataTypes.DATE },
  totalCheckIns: { type: DataTypes.INTEGER, defaultValue: 0 },

  crisisCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastCrisisAt: { type: DataTypes.DATE },

  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  role: { type: DataTypes.ENUM('user', 'admin', 'counselor'), defaultValue: 'user' },
}, {
  tableName: 'users',
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['password'] },
  },
  scopes: {
    withPassword: { attributes: {} },
  },
});

// Hash password before create/update
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
  }
});

// Instance methods
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = this.lastActiveDate ? new Date(this.lastActiveDate) : null;
  if (last) last.setHours(0, 0, 0, 0);

  if (!last || (today - last) > 86400000 * 1.5) {
    this.streak = 1;
  } else if ((today - last) > 0) {
    this.streak += 1;
  }
  this.lastActiveDate = new Date();
};

module.exports = User;
