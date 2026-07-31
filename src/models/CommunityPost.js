const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CommunityPost = sequelize.define('CommunityPost', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:   { type: DataTypes.INTEGER, allowNull: false },
  alias:    { type: DataTypes.STRING, allowNull: false },

  content:  { type: DataTypes.STRING(800), allowNull: false },
  mood:     { type: DataTypes.INTEGER, validate: { min: 1, max: 10 } },
  tags:     { type: DataTypes.JSON, defaultValue: [] },
  category: { type: DataTypes.ENUM('venting','seeking_advice','sharing_win','gratitude') },

  hugs:        { type: DataTypes.INTEGER, defaultValue: 0 },
  meTooPosts:  { type: DataTypes.INTEGER, defaultValue: 0 },
  replies:     { type: DataTypes.JSON, defaultValue: [] },

  isModerated: { type: DataTypes.BOOLEAN, defaultValue: false },
  isFlagged:   { type: DataTypes.BOOLEAN, defaultValue: false },
  isHidden:    { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'community_posts',
  timestamps: true,
});

module.exports = CommunityPost;
