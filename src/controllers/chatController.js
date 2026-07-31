const { v4: uuidv4 } = require('uuid');
const { Op, fn, col, literal } = require('sequelize');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const openaiService = require('../services/openaiService');
const crisisService = require('../services/crisisService');
const logger = require('../utils/logger');

// @route  POST /api/chat/message
const sendMessage = async (req, res) => {
  const { content, sessionId } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

  const user = await User.scope('withPassword').findByPk(req.user.id);
  const sid = sessionId || uuidv4();

  const crisisResult = await crisisService.detectCrisis(content);

  await ChatMessage.create({
    userId: user.id,
    role: 'user',
    content,
    sessionId: sid,
    crisisFlag: crisisResult.detected,
  });

  // Get last 12 messages for context
  const history = await ChatMessage.findAll({
    where: { userId: user.id, sessionId: sid },
    order: [['createdAt', 'DESC']],
    limit: 12,
  });

  const conversationHistory = history
    .reverse()
    .slice(0, -1)
    .map(m => ({ role: m.role, content: m.content }));

  let aiContent;
  if (crisisResult.detected && crisisResult.level !== 'low') {
    aiContent = crisisResult.response.message;
  } else {
    try {
      aiContent = await openaiService.chatResponse(
        content,
        conversationHistory,
        user.aiMemory,
        user.name
      );
    } catch (err) {
      logger.error('AI chat failed:', err.message);
      // Empathetic fallback responses when AI is unavailable
      const fallbacks = [
        `Hey ${user.name || 'there'} 💙 I heard you. I'm having a bit of trouble connecting right now, but I want you to know that what you're feeling matters. Please try again in a minute — I'll be right here.`,
        `I'm here for you ${user.name || ''}, but I'm experiencing a brief connection issue. Take a deep breath — in for 4 counts, hold for 4, out for 4. I'll be back shortly. 🌱`,
        `Thanks for sharing that with me, ${user.name || 'friend'}. My AI brain needs a quick rest (quota limit reached), but your feelings are valid and important. Try again in a minute! 💜`,
      ];
      aiContent = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }

  const aiMessage = await ChatMessage.create({
    userId: user.id,
    role: 'assistant',
    content: aiContent,
    sessionId: sid,
    crisisFlag: crisisResult.detected,
  });

  res.json({
    message: { id: aiMessage.id, content: aiContent, role: 'assistant', createdAt: aiMessage.createdAt },
    sessionId: sid,
    crisis: crisisResult.detected ? {
      level: crisisResult.level,
      calmMode: crisisResult.level !== 'low' ? crisisService.getCalmModeContent() : null,
    } : null,
  });
};

// @route  GET /api/chat/history/:sessionId
const getChatHistory = async (req, res) => {
  const { sessionId } = req.params;
  const messages = await ChatMessage.findAll({
    where: { userId: req.user.id, sessionId },
    order: [['createdAt', 'ASC']],
    limit: 50,
  });
  res.json({ messages });
};

// @route  GET /api/chat/sessions
const getSessions = async (req, res) => {
  const { sequelize } = require('../config/db');

  // Replaces MongoDB aggregation — group by sessionId using raw SQL
  const sessions = await sequelize.query(
    `SELECT sessionId,
            SUBSTRING_INDEX(GROUP_CONCAT(content ORDER BY createdAt DESC SEPARATOR '|||'), '|||', 1) AS lastMessage,
            MAX(createdAt) AS lastAt,
            COUNT(*) AS messageCount
     FROM chat_messages
     WHERE userId = :userId
     GROUP BY sessionId
     ORDER BY lastAt DESC
     LIMIT 20`,
    { replacements: { userId: req.user.id }, type: sequelize.QueryTypes.SELECT }
  );

  res.json({ sessions });
};

module.exports = { sendMessage, getChatHistory, getSessions };
