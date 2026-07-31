const Journal = require('../models/Journal');
const openaiService = require('../services/openaiService');
const crisisService = require('../services/crisisService');
const User = require('../models/User');

const createEntry = async (req, res) => {
  const { title, content, mood, tags } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required.' });

  const crisis = await crisisService.detectCrisis(content);

  const user = await User.findByPk(req.user.id, { attributes: ['id', 'name'] });

  let aiReflection = null;
  try {
    const reflection = await openaiService.generateJournalReflection(content, user.name);
    aiReflection = { ...reflection, generatedAt: new Date() };
  } catch (err) { /* non-critical */ }

  const entry = await Journal.create({
    userId: req.user.id,
    title,
    content,
    mood,
    tags: tags || [],
    aiReflection,
  });

  res.status(201).json({
    entry,
    crisis: crisis.detected ? {
      level: crisis.level,
      message: crisis.response.message,
    } : null,
  });
};

const getEntries = async (req, res) => {
  const { page = 1, limit = 15 } = req.query;
  const { count, rows: entries } = await Journal.findAndCountAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    attributes: ['id', 'title', 'mood', 'tags', 'createdAt', 'aiReflection'],
  });
  res.json({ entries, totalPages: Math.ceil(count / limit), total: count });
};

const getEntry = async (req, res) => {
  const entry = await Journal.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!entry) return res.status(404).json({ error: 'Not found.' });
  res.json({ entry });
};

const deleteEntry = async (req, res) => {
  await Journal.destroy({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ message: 'Entry deleted.' });
};

module.exports = { createEntry, getEntries, getEntry, deleteEntry };
