require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Load all models so Sequelize knows about them before sync
require('./models/User');
require('./models/MoodEntry');
require('./models/Recommendation');
require('./models/Journal');
require('./models/ChatMessage');
require('./models/CommunityPost');

const PORT = process.env.PORT || 5000;

connectDB().then((connected) => {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 MoodEnhancer backend running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    if (connected) {
      logger.info('✅ MySQL connected — all tables auto-synced');
    } else {
      logger.warn('⚠️  Running without MySQL — check DB_* vars in .env');
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${PORT} is already in use.`);
      logger.warn(`   Run this to free it: Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}).catch((err) => {
  logger.error('Unexpected startup error:', err.message);
  app.listen(PORT, () => {
    logger.info(`🚀 MoodEnhancer backend running on http://localhost:${PORT} (no DB)`);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err.message);
});
