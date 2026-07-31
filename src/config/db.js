const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'MOODY',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false, // set to (msg) => logger.debug(msg) to see SQL
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: false,
      timestamps: true,
    },
  }
);

let isConnected = false;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ MySQL connected successfully');

    // Auto-create / update all tables
    await sequelize.sync({ alter: true });
    logger.info('✅ All tables synced');
    isConnected = true;
    return true;
  } catch (err) {
    logger.error(`❌ MySQL connection failed: ${err.message}`);
    logger.warn('   Check DB_USER, DB_PASS, DB_NAME, DB_HOST in .env');
    return false;
  }
};

const getConnectionStatus = () => isConnected;

module.exports = connectDB;
module.exports.sequelize = sequelize;
module.exports.getConnectionStatus = getConnectionStatus;
