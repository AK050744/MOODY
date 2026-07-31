const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { getConnectionStatus } = require('./config/db');

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

// Allow multiple frontend origins (Vite on 5173, custom on 8080, etc.)
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts. Try again in 15 minutes.' },
});

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Root route (prevents "Route GET / not found" error) ───────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MoodEnhancer API is running 🚀',
    version: '1.0.0',
    db: getConnectionStatus() ? 'connected' : 'disconnected',
    docs: '/health',
  });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const dbConnected = getConnectionStatus();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'healthy' : 'degraded',
    db: dbConnected ? 'connected' : 'disconnected — set MONGODB_URI in .env',
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',            authLimiter, require('./routes/authRoutes'));
app.use('/api/mood',            require('./routes/moodRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/chat',            require('./routes/chatRoutes'));
app.use('/api/journal',         require('./routes/journalRoutes'));
app.use('/api/analytics',       require('./routes/analyticsRoutes'));
app.use('/api/community',       require('./routes/communityRoutes'));

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;

