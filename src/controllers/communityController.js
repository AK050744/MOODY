const CommunityPost = require('../models/CommunityPost');
const crisisService = require('../services/crisisService');

const ANIMALS = ['Sparrow','Fox','Owl','Deer','Bear','Wolf','Crane','Panda','Lynx','Finch'];
const ADJECTIVES = ['Calm','Gentle','Brave','Quiet','Warm','Kind','Bold','Soft','Still'];
const generateAlias = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj} ${animal} #${num}`;
};

// @route  GET /api/community/posts
const getPosts = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const where = { isHidden: false };

  const { count, rows: posts } = await CommunityPost.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    attributes: { exclude: ['userId'] }, // never expose real user ID
  });

  res.json({ posts, total: count });
};

// @route  POST /api/community/posts
const createPost = async (req, res) => {
  const { content, mood, tags, category } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required.' });
  if (content.length > 800) return res.status(400).json({ error: 'Post too long (max 800 chars).' });

  const crisis = await crisisService.detectCrisis(content);
  if (crisis.level === 'critical') {
    return res.status(200).json({
      blocked: true,
      crisis: { message: crisis.response.message, calmMode: crisisService.getCalmModeContent() },
    });
  }

  const post = await CommunityPost.create({
    userId: req.user.id,
    alias: generateAlias(),
    content,
    mood,
    tags: tags || [],
    category,
  });

  const safe = post.toJSON();
  delete safe.userId;
  res.status(201).json({ post: safe });
};

// @route  POST /api/community/posts/:id/hug
const sendHug = async (req, res) => {
  const post = await CommunityPost.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  post.hugs += 1;
  await post.save();
  res.json({ hugs: post.hugs });
};

// @route  POST /api/community/posts/:id/reply
const addReply = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Reply cannot be empty.' });

  const crisis = await crisisService.detectCrisis(content);
  const post = await CommunityPost.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  const replies = [...(post.replies || []), {
    alias: generateAlias(),
    content,
    createdAt: new Date(),
  }];
  post.replies = replies;
  await post.save();

  res.json({
    replies: post.replies,
    crisis: crisis.detected ? { level: crisis.level, message: crisis.response.message } : null,
  });
};

module.exports = { getPosts, createPost, sendHug, addReply };
