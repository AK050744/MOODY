const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Recommendation = sequelize.define('Recommendation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:      { type: DataTypes.INTEGER, allowNull: false },
  moodEntryId: { type: DataTypes.INTEGER },

  type:         { type: DataTypes.ENUM('movie','song','podcast','game','audiobook','activity','meditation') },
  title:        { type: DataTypes.STRING },
  description:  { type: DataTypes.TEXT },
  thumbnailUrl: { type: DataTypes.STRING },
  externalUrl:  { type: DataTypes.STRING },
  platform:     { type: DataTypes.STRING },
  score:        { type: DataTypes.FLOAT },
  emotionTarget: { type: DataTypes.JSON, defaultValue: [] },
  moodScoreAtTime: { type: DataTypes.INTEGER },

  feedback: { type: DataTypes.JSON, defaultValue: null },
}, {
  tableName: 'recommendations',
  timestamps: true,
});

module.exports = Recommendation;
