const Recommendation = require('../models/Recommendation');
const User = require('../models/User');

const getRecommendations = async (req, res) => {
  const { type, limit = 20 } = req.query;
  const where = { userId: req.user.id };
  if (type) where.type = type;

  const recs = await Recommendation.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
  });
  res.json({ recommendations: recs });
};

const submitFeedback = async (req, res) => {
  const { liked, consumed, helpedMood } = req.body;
  const rec = await Recommendation.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!rec) return res.status(404).json({ error: 'Not found.' });

  rec.feedback = { liked, consumed, helpedMood, ratedAt: new Date() };
  await rec.save();

  // If they disliked it, add to user's dislikedContent preferences
  if (liked === false) {
    const user = await User.findByPk(req.user.id);
    const prefs = user.preferences || {};
    const disliked = prefs.dislikedContent || [];
    if (!disliked.includes(rec.title)) {
      user.preferences = { ...prefs, dislikedContent: [...disliked, rec.title] };
      await user.save();
    }
  }

  res.json({ recommendation: rec });
};

module.exports = { getRecommendations, submitFeedback };
