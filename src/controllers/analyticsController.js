const { Op } = require('sequelize');
const MoodEntry = require('../models/MoodEntry');
const User = require('../models/User');
const openaiService = require('../services/openaiService');

// @route  GET /api/analytics/dashboard
const getDashboard = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const last30 = new Date(now - 30 * 86400000);
  const last7  = new Date(now - 7 * 86400000);

  const [entries30, entries7, user] = await Promise.all([
    MoodEntry.findAll({ where: { userId, createdAt: { [Op.gte]: last30 } }, order: [['createdAt', 'ASC']] }),
    MoodEntry.findAll({ where: { userId, createdAt: { [Op.gte]: last7 } },  order: [['createdAt', 'ASC']] }),
    User.findByPk(userId, { attributes: ['streak', 'totalCheckIns', 'aiMemory'] }),
  ]);

  const avg = (arr) => arr.length ? (arr.reduce((s, e) => s + e.moodScore, 0) / arr.length).toFixed(1) : null;

  // Daily mood trend
  const dailyMap = {};
  entries30.forEach(e => {
    const day = e.createdAt.toISOString().split('T')[0];
    if (!dailyMap[day]) dailyMap[day] = [];
    dailyMap[day].push(e.moodScore);
  });
  const moodTrend = Object.entries(dailyMap).map(([date, scores]) => ({
    date,
    avg: +(scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1),
  }));

  // Emotion distribution
  const emotionCounts = {};
  entries30.forEach(e => {
    const em = e.aiAnalysis?.primaryEmotion;
    if (em) emotionCounts[em] = (emotionCounts[em] || 0) + 1;
  });

  const burnoutRisk = assessBurnoutRisk(entries7);

  res.json({
    stats: {
      streak: user.streak,
      totalCheckIns: user.totalCheckIns,
      avg30Days: avg(entries30),
      avg7Days: avg(entries7),
      totalEntries30: entries30.length,
    },
    moodTrend,
    emotionDistribution: emotionCounts,
    burnoutRisk,
    aiMemory: user.aiMemory,
  });
};

// @route  GET /api/analytics/weekly-report
const getWeeklyReport = async (req, res) => {
  const last7 = new Date(Date.now() - 7 * 86400000);
  const entries = await MoodEntry.findAll({
    where: { userId: req.user.id, createdAt: { [Op.gte]: last7 } },
    order: [['createdAt', 'ASC']],
  });

  if (entries.length < 2) {
    return res.json({ message: 'Not enough data for a weekly report yet. Keep checking in!' });
  }

  const user = await User.findByPk(req.user.id, { attributes: ['name'] });
  const report = await openaiService.generateWeeklyReport(entries, user.name);
  res.json({ report, entriesCount: entries.length });
};

// @route  GET /api/analytics/patterns
const getPatterns = async (req, res) => {
  const entries = await MoodEntry.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 60,
  });

  const byDay = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  entries.forEach(e => {
    const day = new Date(e.createdAt).getDay();
    byDay[day].push(e.moodScore);
  });
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const moodByDay = Object.entries(byDay)
    .filter(([, scores]) => scores.length > 0)
    .map(([day, scores]) => ({
      day: dayNames[day],
      avg: +(scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1),
    }));

  const stressorCount = {};
  entries.forEach(e => {
    (e.context?.stressors || []).forEach(s => {
      stressorCount[s] = (stressorCount[s] || 0) + 1;
    });
  });

  const sleepMoodData = entries
    .filter(e => e.context?.sleepHours)
    .map(e => ({ sleep: e.context.sleepHours, mood: e.moodScore }));

  res.json({ moodByDay, topStressors: stressorCount, sleepMoodData });
};

const assessBurnoutRisk = (entries7) => {
  if (entries7.length < 3) return { level: 'unknown', score: 0 };
  const avgScore = entries7.reduce((s, e) => s + e.moodScore, 0) / entries7.length;
  const lowDays = entries7.filter(e => e.moodScore <= 4).length;
  const stressThemes = entries7.filter(e =>
    (e.aiAnalysis?.themes || []).some(t => ['stress', 'overwhelm', 'exhaustion'].includes(t))
  ).length;

  let score = 0;
  if (avgScore < 4) score += 40;
  else if (avgScore < 5) score += 20;
  if (lowDays >= 5) score += 30;
  else if (lowDays >= 3) score += 15;
  if (stressThemes >= 4) score += 30;

  return {
    level: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low',
    score,
    message: score >= 60
      ? 'You may be heading toward burnout. Please talk to someone you trust.'
      : score >= 30
      ? "You've had a tough week. Be gentle with yourself."
      : "You're managing well. Keep going.",
  };
};

module.exports = { getDashboard, getWeeklyReport, getPatterns };
