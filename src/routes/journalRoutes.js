const router = require('express').Router();
const { createEntry, getEntries, getEntry, deleteEntry } = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.post('/', createEntry);
router.get('/', getEntries);
router.get('/:id', getEntry);
router.delete('/:id', deleteEntry);
module.exports = router;
