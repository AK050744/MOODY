const router = require('express').Router();
const { getPosts, createPost, sendHug, addReply } = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/posts', getPosts);
router.post('/posts', createPost);
router.post('/posts/:id/hug', sendHug);
router.post('/posts/:id/reply', addReply);
module.exports = router;
