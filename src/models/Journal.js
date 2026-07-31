const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Journal = sequelize.define('Journal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:  { type: DataTypes.INTEGER, allowNull: false },

  title:   { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT, allowNull: false },
  mood:    { type: DataTypes.INTEGER, validate: { min: 1, max: 10 } },
  tags:    { type: DataTypes.JSON, defaultValue: [] },

  aiReflection: { type: DataTypes.JSON, defaultValue: null },
}, {
  tableName: 'journals',
  timestamps: true,
});

module.exports = Journal;
