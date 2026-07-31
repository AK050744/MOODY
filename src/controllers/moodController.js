const { Op } = require('sequelize');
const MoodEntry = require('../models/MoodEntry');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const openaiService = require('../services/openaiService');
const crisisService = require('../services/crisisService');
const externalApiService = require('../services/externalApiService');
const logger = require('../utils/logger');

// @route  POST /api/mood/checkin
const checkIn = async (req, res) => {
  const { rawText, moodScore, selectedEmotions, context } = req.body;
  const user = await User.scope('withPassword').findByPk(req.user.id);

  if (!moodScore || moodScore < 1 || moodScore > 10) {
    return res.status(400).json({ error: 'Mood score must be between 1 and 10.' });
  }

  // ── 1. Crisis Detection ────────────────────────────────────────────────────
  const textToScan = rawText || (selectedEmotions || []).join(' ');
  const crisisResult = await crisisService.detectCrisis(textToScan);

  if (crisisResult.detected) {
    user.crisisCount = (user.crisisCount || 0) + 1;
    user.lastCrisisAt = new Date();
  }

  // ── 2. AI Mood Analysis ────────────────────────────────────────────────────
  let aiAnalysis = null;
  if (rawText && rawText.length > 10) {
    try {
      aiAnalysis = await openaiService.analyzeMood(rawText, selectedEmotions, moodScore);
    } catch (err) {
      logger.error('Mood analysis failed:', err.message);
      aiAnalysis = {
        primaryEmotion: (selectedEmotions || [])[0] || 'unknown',
        emotionScores: {},
        themes: [],
        sentiment: moodScore >= 6 ? 'positive' : moodScore >= 4 ? 'neutral' : 'negative',
        summary: `Feeling ${(selectedEmotions || [])[0] || 'various emotions'} today.`,
      };
    }
  }

  // ── 3. Save mood entry ─────────────────────────────────────────────────────
  const moodEntry = await MoodEntry.create({
    userId: user.id,
    rawText,
    moodScore,
    selectedEmotions: selectedEmotions || [],
    aiAnalysis,
    context: context || null,
    crisisDetected: crisisResult.detected,
    crisisLevel: crisisResult.level,
    crisisKeywords: crisisResult.keywords || [],
  });

  // ── 4. Update user stats ───────────────────────────────────────────────────
  user.totalCheckIns += 1;
  user.updateStreak();

  if (user.totalCheckIns % 5 === 0) {
    try {
      const recentEntries = await MoodEntry.findAll({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
        limit: 10,
      });
      const newMemory = await openaiService.updateUserMemory(recentEntries, user.aiMemory);
      user.aiMemory = { ...newMemory, lastUpdated: new Date() };
    } catch (err) {
      logger.error('Memory update failed:', err.message);
    }
  }

  await user.save();

  // ── 5. Generate recommendations ────────────────────────────────────────────
  let recommendations = [];
  try {
    const aiRecs = await openaiService.generateRecommendations(
      aiAnalysis || { primaryEmotion: (selectedEmotions || [])[0] || 'sad', themes: [], sentiment: 'neutral' },
      user.aiMemory,
      user.preferences,
      moodScore
    );

    const enriched = await Promise.all(
      aiRecs.map(rec => externalApiService.enrichRecommendation(rec))
    );

    recommendations = await Recommendation.bulkCreate(
      enriched.map(rec => ({
        userId: user.id,
        moodEntryId: moodEntry.id,
        moodScoreAtTime: moodScore,
        emotionTarget: rec.emotionTarget || [],
        ...rec,
      }))
    );
  } catch (err) {
    logger.error('Recommendation generation failed:', err.message);
  }

  // ── 6. Response ────────────────────────────────────────────────────────────
  res.status(201).json({
    moodEntry: {
      id: moodEntry.id,
      moodScore,
      aiAnalysis,
      createdAt: moodEntry.createdAt,
    },
    recommendations,
    crisis: crisisResult.detected ? {
      detected: true,
      level: crisisResult.level,
      message: crisisResult.response.message,
      requiresAction: crisisResult.response.requiresAction,
      calmMode: crisisService.getCalmModeContent(),
    } : null,
    streak: user.streak,
    totalCheckIns: user.totalCheckIns,
  });
};

// @route  GET /api/mood/history
const getHistory = async (req, res) => {
  const { page = 1, limit = 20, days } = req.query;
  const where = { userId: req.user.id };

  if (days) {
    where.createdAt = { [Op.gte]: new Date(Date.now() - days * 86400000) };
  }

  const { count, rows: entries } = await MoodEntry.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    attributes: { exclude: ['rawText'] },
  });

  res.json({
    entries,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    total: count,
  });
};

// @route  GET /api/mood/today
const getTodayMood = async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const entry = await MoodEntry.findOne({
    where: {
      userId: req.user.id,
      createdAt: { [Op.gte]: startOfDay },
    },
    order: [['createdAt', 'DESC']],
  });

  res.json({ entry, hasCheckedInToday: !!entry });
};

// @route  POST /api/mood/:id/followup
const followUp = async (req, res) => {
  const { followUpScore } = req.body;
  const entry = await MoodEntry.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!entry) return res.status(404).json({ error: 'Entry not found.' });

  entry.followUpScore = followUpScore;
  entry.followUpAt = new Date();
  await entry.save();

  res.json({ entry });
};

// @route  GET /api/mood/calm-mode
const calmMode = async (req, res) => {
  res.json(crisisService.getCalmModeContent());
};

module.exports = { checkIn, getHistory, getTodayMood, followUp, calmMode };
