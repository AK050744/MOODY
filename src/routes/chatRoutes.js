const router = require('express').Router();
const { sendMessage, getChatHistory, getSessions } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.post('/message', sendMessage);
router.get('/sessions', getSessions);
router.get('/history/:sessionId', getChatHistory);
module.exports = router;
