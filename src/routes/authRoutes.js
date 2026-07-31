const router = require('express').Router();
const { body } = require('express-validator');
const { signup, login, getMe, updatePreferences } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
], signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
module.exports = router;
