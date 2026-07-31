const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MoodEntry = sequelize.define('MoodEntry', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },

  rawText: { type: DataTypes.TEXT },
  moodScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 10 },
  },

  selectedEmotions: { type: DataTypes.JSON, defaultValue: [] },

  // Full AI analysis stored as JSON
  aiAnalysis: { type: DataTypes.JSON, defaultValue: null },

  // Crisis fields
  crisisDetected:     { type: DataTypes.BOOLEAN, defaultValue: false },
  crisisLevel:        { type: DataTypes.ENUM('none','low','medium','high','critical'), defaultValue: 'none' },
  crisisKeywords:     { type: DataTypes.JSON, defaultValue: [] },
  crisisAcknowledged: { type: DataTypes.BOOLEAN, defaultValue: false },

  // Context
  context: { type: DataTypes.JSON, defaultValue: null },

  // Follow-up
  followUpScore: { type: DataTypes.INTEGER },
  followUpAt:    { type: DataTypes.DATE },
}, {
  tableName: 'mood_entries',
  timestamps: true,
});

module.exports = MoodEntry;
