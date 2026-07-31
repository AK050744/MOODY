const router = require('express').Router();
const { getDashboard, getWeeklyReport, getPatterns } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/weekly-report', getWeeklyReport);
router.get('/patterns', getPatterns);
module.exports = router;
