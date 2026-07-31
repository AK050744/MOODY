const router = require('express').Router();
const { getRecommendations, submitFeedback } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/', getRecommendations);
router.post('/:id/feedback', submitFeedback);
module.exports = router;
